(function () {
    'use strict';

    const DB_NAME = 'citebox-static-db';
    const DB_VERSION = 1;
    const STORES = {
        papers: 'papers',
        groups: 'groups',
        tags: 'tags'
    };
    const PDFJS_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.5.207/legacy/build/pdf.min.mjs';
    const PDFJS_WORKER_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.5.207/legacy/build/pdf.worker.min.mjs';

    const state = {
        papers: [],
        groups: [],
        tags: [],
        filters: {
            keyword: '',
            groupId: '',
            tagId: ''
        },
        selectedPaperId: '',
        reader: {
            paperId: '',
            page: 1,
            pdf: null,
            rendering: false
        }
    };

    let dbPromise = null;
    let pdfjsPromise = null;
    let toastTimer = null;

    const dom = {};

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        cacheDom();
        bindEvents();

        try {
            await openDatabase();
            await refreshState();
            renderAll();
            showToast('CiteBox 静态版已就绪。', 'success');
        } catch (error) {
            console.error(error);
            showToast(`初始化失败：${error.message}`, 'error');
        }
    }

    function cacheDom() {
        dom.summaryStats = document.getElementById('summaryStats');
        dom.paperList = document.getElementById('paperList');
        dom.paperListMeta = document.getElementById('paperListMeta');
        dom.paperDetail = document.getElementById('paperDetail');
        dom.notesList = document.getElementById('notesList');
        dom.groupList = document.getElementById('groupList');
        dom.tagList = document.getElementById('tagList');
        dom.filterSummary = document.getElementById('filterSummary');
        dom.groupFilter = document.getElementById('groupFilter');
        dom.tagFilter = document.getElementById('tagFilter');
        dom.keywordInput = document.getElementById('keywordInput');
        dom.fileInput = document.getElementById('fileInput');
        dom.importFileInput = document.getElementById('importFileInput');
        dom.toastRegion = document.getElementById('toastRegion');
        dom.busyOverlay = document.getElementById('busyOverlay');
        dom.busyMessage = document.getElementById('busyMessage');
        dom.backupMeta = document.getElementById('backupMeta');
        dom.groupForm = document.getElementById('groupForm');
        dom.groupEditId = document.getElementById('groupEditId');
        dom.groupNameInput = document.getElementById('groupNameInput');
        dom.groupDescriptionInput = document.getElementById('groupDescriptionInput');
        dom.groupCancelEditButton = document.getElementById('groupCancelEditButton');
        dom.tagForm = document.getElementById('tagForm');
        dom.tagEditId = document.getElementById('tagEditId');
        dom.tagNameInput = document.getElementById('tagNameInput');
        dom.tagColorInput = document.getElementById('tagColorInput');
        dom.tagCancelEditButton = document.getElementById('tagCancelEditButton');
        dom.readerModal = document.getElementById('readerModal');
        dom.readerCanvas = document.getElementById('readerCanvas');
        dom.readerTitle = document.getElementById('readerTitle');
        dom.readerMeta = document.getElementById('readerMeta');
        dom.readerPageLabel = document.getElementById('readerPageLabel');
        dom.readerNoteInput = document.getElementById('readerNoteInput');
        dom.readerPrevButton = document.getElementById('readerPrevButton');
        dom.readerNextButton = document.getElementById('readerNextButton');
    }

    function bindEvents() {
        document.getElementById('heroUploadButton').addEventListener('click', openFilePicker);
        document.getElementById('topUploadButton').addEventListener('click', openFilePicker);
        document.getElementById('uploadDropzone').addEventListener('click', openFilePicker);
        document.getElementById('clearFiltersButton').addEventListener('click', clearFilters);
        document.getElementById('importBackupButton').addEventListener('click', () => dom.importFileInput.click());
        document.getElementById('exportBackupButton').addEventListener('click', exportBackup);
        document.getElementById('resetLibraryButton').addEventListener('click', resetLibrary);
        document.getElementById('groupCancelEditButton').addEventListener('click', resetGroupForm);
        document.getElementById('tagCancelEditButton').addEventListener('click', resetTagForm);
        document.getElementById('closeReaderButton').addEventListener('click', closeReader);
        document.getElementById('saveReaderNoteButton').addEventListener('click', saveReaderNote);
        document.getElementById('readerPrevButton').addEventListener('click', () => changeReaderPage(-1));
        document.getElementById('readerNextButton').addEventListener('click', () => changeReaderPage(1));
        document.getElementById('readerModal').addEventListener('click', handleModalBackdrop);

        dom.fileInput.addEventListener('change', handleFileSelection);
        dom.importFileInput.addEventListener('change', handleImportSelection);
        dom.keywordInput.addEventListener('input', handleFilterChange);
        dom.groupFilter.addEventListener('change', handleFilterChange);
        dom.tagFilter.addEventListener('change', handleFilterChange);
        dom.groupForm.addEventListener('submit', saveGroup);
        dom.tagForm.addEventListener('submit', saveTag);

        dom.paperList.addEventListener('click', handlePaperListClick);
        dom.paperDetail.addEventListener('submit', handleDetailSubmit);
        dom.paperDetail.addEventListener('click', handleDetailClick);
        dom.notesList.addEventListener('click', handleNotesClick);
        dom.groupList.addEventListener('click', handleGroupListClick);
        dom.tagList.addEventListener('click', handleTagListClick);

        const dropzone = document.getElementById('uploadDropzone');
        ['dragenter', 'dragover'].forEach((eventName) => {
            dropzone.addEventListener(eventName, (event) => {
                event.preventDefault();
                dropzone.classList.add('is-dragover');
            });
        });
        ['dragleave', 'dragend', 'drop'].forEach((eventName) => {
            dropzone.addEventListener(eventName, (event) => {
                event.preventDefault();
                dropzone.classList.remove('is-dragover');
            });
        });
        dropzone.addEventListener('drop', async (event) => {
            if (!event.dataTransfer?.files?.length) {
                return;
            }
            await importFiles(event.dataTransfer.files);
        });

        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !dom.readerModal.classList.contains('hidden')) {
                closeReader();
            }
        });
    }

    function openFilePicker() {
        dom.fileInput.click();
    }

    async function handleFileSelection(event) {
        const files = event.target.files;
        await importFiles(files);
        event.target.value = '';
    }

    function handleFilterChange() {
        state.filters.keyword = dom.keywordInput.value.trim();
        state.filters.groupId = dom.groupFilter.value;
        state.filters.tagId = dom.tagFilter.value;
        renderPaperList();
        renderPaperDetail();
        renderNotes();
        renderSummary();
        renderFilterSummary();
    }

    function clearFilters() {
        state.filters.keyword = '';
        state.filters.groupId = '';
        state.filters.tagId = '';
        dom.keywordInput.value = '';
        dom.groupFilter.value = '';
        dom.tagFilter.value = '';
        renderPaperList();
        renderPaperDetail();
        renderNotes();
        renderSummary();
        renderFilterSummary();
    }

    function handlePaperListClick(event) {
        const button = event.target.closest('[data-action]');
        if (button) {
            const paperId = button.dataset.paperId;
            if (button.dataset.action === 'open-reader') {
                openReader(paperId);
            }
            return;
        }

        const card = event.target.closest('[data-paper-card]');
        if (!card) {
            return;
        }
        state.selectedPaperId = card.dataset.paperCard;
        renderPaperList();
        renderPaperDetail();
    }

    async function handleDetailSubmit(event) {
        event.preventDefault();
        const form = event.target.closest('form[data-paper-form]');
        if (!form) {
            return;
        }

        const paperId = form.dataset.paperForm;
        const paper = findPaper(paperId);
        if (!paper) {
            showToast('找不到要保存的文献。', 'error');
            return;
        }

        const formData = new FormData(form);
        const nextTagIds = formData.getAll('tagIds');
        const updatedPaper = {
            ...paper,
            title: String(formData.get('title') || '').trim() || paper.title,
            groupId: String(formData.get('groupId') || ''),
            tagIds: nextTagIds,
            notes: String(formData.get('notes') || '').trim(),
            updatedAt: new Date().toISOString()
        };

        await putRecord(STORES.papers, updatedPaper);
        await refreshState(paperId);
        renderAll();
        showToast('文献详情已保存。', 'success');
    }

    async function handleDetailClick(event) {
        const actionButton = event.target.closest('[data-detail-action]');
        if (!actionButton) {
            return;
        }

        const paperId = actionButton.dataset.paperId;
        if (actionButton.dataset.detailAction === 'open-reader') {
            await openReader(paperId);
            return;
        }

        if (actionButton.dataset.detailAction === 'delete-paper') {
            const paper = findPaper(paperId);
            if (!paper) {
                return;
            }
            const confirmed = window.confirm(`确定删除《${paper.title}》吗？这会同时删除本地 PDF 与笔记。`);
            if (!confirmed) {
                return;
            }
            await deleteRecord(STORES.papers, paperId);
            await refreshState();
            renderAll();
            showToast('文献已删除。', 'success');
        }
    }

    async function handleNotesClick(event) {
        const button = event.target.closest('[data-notes-action]');
        if (!button) {
            return;
        }
        const paperId = button.dataset.paperId;
        state.selectedPaperId = paperId;
        renderPaperList();
        renderPaperDetail();
        if (button.dataset.notesAction === 'open-reader') {
            await openReader(paperId);
            return;
        }
        document.getElementById('library').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function handleGroupListClick(event) {
        const button = event.target.closest('[data-group-action]');
        if (!button) {
            return;
        }
        const groupId = button.dataset.groupId;
        const group = state.groups.find((item) => item.id === groupId);
        if (!group) {
            return;
        }

        if (button.dataset.groupAction === 'edit') {
            dom.groupEditId.value = group.id;
            dom.groupNameInput.value = group.name;
            dom.groupDescriptionInput.value = group.description || '';
            dom.groupCancelEditButton.classList.remove('hidden');
            dom.groupNameInput.focus();
            return;
        }

        if (button.dataset.groupAction === 'delete') {
            const confirmed = window.confirm(`确定删除分组“${group.name}”吗？相关文献会保留，但会失去分组关联。`);
            if (!confirmed) {
                return;
            }

            const affectedPapers = state.papers.filter((paper) => paper.groupId === group.id);
            await Promise.all(
                affectedPapers.map((paper) => putRecord(STORES.papers, {
                    ...paper,
                    groupId: '',
                    updatedAt: new Date().toISOString()
                }))
            );
            await deleteRecord(STORES.groups, group.id);
            await refreshState();
            resetGroupForm();
            renderAll();
            showToast('分组已删除。', 'success');
        }
    }

    async function handleTagListClick(event) {
        const button = event.target.closest('[data-tag-action]');
        if (!button) {
            return;
        }
        const tagId = button.dataset.tagId;
        const tag = state.tags.find((item) => item.id === tagId);
        if (!tag) {
            return;
        }

        if (button.dataset.tagAction === 'edit') {
            dom.tagEditId.value = tag.id;
            dom.tagNameInput.value = tag.name;
            dom.tagColorInput.value = tag.color || '#a45c40';
            dom.tagCancelEditButton.classList.remove('hidden');
            dom.tagNameInput.focus();
            return;
        }

        if (button.dataset.tagAction === 'delete') {
            const confirmed = window.confirm(`确定删除标签“${tag.name}”吗？相关文献会保留，但会失去这个标签。`);
            if (!confirmed) {
                return;
            }

            const affectedPapers = state.papers.filter((paper) => Array.isArray(paper.tagIds) && paper.tagIds.includes(tag.id));
            await Promise.all(
                affectedPapers.map((paper) => putRecord(STORES.papers, {
                    ...paper,
                    tagIds: paper.tagIds.filter((item) => item !== tag.id),
                    updatedAt: new Date().toISOString()
                }))
            );
            await deleteRecord(STORES.tags, tag.id);
            await refreshState();
            resetTagForm();
            renderAll();
            showToast('标签已删除。', 'success');
        }
    }

    async function saveGroup(event) {
        event.preventDefault();
        const name = dom.groupNameInput.value.trim();
        const description = dom.groupDescriptionInput.value.trim();
        if (!name) {
            showToast('请先填写分组名称。', 'error');
            return;
        }

        const existing = state.groups.find((item) => item.name.toLowerCase() === name.toLowerCase() && item.id !== dom.groupEditId.value);
        if (existing) {
            showToast('分组名称已存在。', 'error');
            return;
        }

        await putRecord(STORES.groups, {
            id: dom.groupEditId.value || makeId('group'),
            name,
            description,
            updatedAt: new Date().toISOString()
        });

        await refreshState();
        resetGroupForm();
        renderAll();
        showToast('分组已保存。', 'success');
    }

    async function saveTag(event) {
        event.preventDefault();
        const name = dom.tagNameInput.value.trim();
        const color = dom.tagColorInput.value || '#a45c40';
        if (!name) {
            showToast('请先填写标签名称。', 'error');
            return;
        }

        const existing = state.tags.find((item) => item.name.toLowerCase() === name.toLowerCase() && item.id !== dom.tagEditId.value);
        if (existing) {
            showToast('标签名称已存在。', 'error');
            return;
        }

        await putRecord(STORES.tags, {
            id: dom.tagEditId.value || makeId('tag'),
            name,
            color,
            updatedAt: new Date().toISOString()
        });

        await refreshState();
        resetTagForm();
        renderAll();
        showToast('标签已保存。', 'success');
    }

    function resetGroupForm() {
        dom.groupEditId.value = '';
        dom.groupNameInput.value = '';
        dom.groupDescriptionInput.value = '';
        dom.groupCancelEditButton.classList.add('hidden');
    }

    function resetTagForm() {
        dom.tagEditId.value = '';
        dom.tagNameInput.value = '';
        dom.tagColorInput.value = '#a45c40';
        dom.tagCancelEditButton.classList.add('hidden');
    }

    function handleModalBackdrop(event) {
        if (event.target.dataset.closeModal === 'true') {
            closeReader();
        }
    }

    async function saveReaderNote() {
        const paper = findPaper(state.reader.paperId);
        if (!paper) {
            return;
        }

        await putRecord(STORES.papers, {
            ...paper,
            notes: dom.readerNoteInput.value.trim(),
            lastReadPage: state.reader.page,
            updatedAt: new Date().toISOString()
        });

        await refreshState(state.reader.paperId);
        renderAll();
        showToast('阅读笔记已保存。', 'success');
    }

    async function changeReaderPage(direction) {
        if (!state.reader.pdf) {
            return;
        }
        const nextPage = state.reader.page + direction;
        if (nextPage < 1 || nextPage > state.reader.pdf.numPages) {
            return;
        }
        state.reader.page = nextPage;
        await renderReaderPage();
    }

    async function handleImportSelection(event) {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        try {
            setBusy('正在导入备份…');
            const raw = await file.text();
            const snapshot = JSON.parse(raw);
            await restoreBackup(snapshot);
            await refreshState();
            renderAll();
            showToast('备份已恢复。', 'success');
        } catch (error) {
            console.error(error);
            showToast(`导入失败：${error.message}`, 'error');
        } finally {
            event.target.value = '';
            clearBusy();
        }
    }

    async function exportBackup() {
        if (!state.papers.length && !state.groups.length && !state.tags.length) {
            showToast('当前还没有可导出的本地数据。', 'error');
            return;
        }

        try {
            setBusy('正在生成备份文件…');
            const papers = await Promise.all(
                state.papers.map(async (paper) => {
                    const pdfDataUrl = paper.pdfBlob ? await blobToDataURL(paper.pdfBlob) : '';
                    const nextPaper = { ...paper, pdfDataUrl };
                    delete nextPaper.pdfBlob;
                    return nextPaper;
                })
            );

            const snapshot = {
                app: 'CiteBox Static',
                version: 1,
                exportedAt: new Date().toISOString(),
                groups: state.groups,
                tags: state.tags,
                papers
            };

            const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `citebox-backup-${formatDateForFilename(new Date())}.json`;
            anchor.click();
            URL.revokeObjectURL(url);
            showToast('备份文件已生成。', 'success');
        } catch (error) {
            console.error(error);
            showToast(`导出失败：${error.message}`, 'error');
        } finally {
            clearBusy();
        }
    }

    async function resetLibrary() {
        const confirmed = window.confirm('确定清空当前浏览器中的全部文献、标签、分组和笔记吗？此操作不可撤销。');
        if (!confirmed) {
            return;
        }

        try {
            setBusy('正在清空本地文献库…');
            await clearStore(STORES.papers);
            await clearStore(STORES.groups);
            await clearStore(STORES.tags);
            closeReader();
            await refreshState();
            resetGroupForm();
            resetTagForm();
            renderAll();
            showToast('本地文献库已清空。', 'success');
        } catch (error) {
            console.error(error);
            showToast(`清空失败：${error.message}`, 'error');
        } finally {
            clearBusy();
        }
    }

    async function importFiles(fileList) {
        const files = Array.from(fileList || []).filter((file) => /\.pdf$/i.test(file.name) || file.type === 'application/pdf');
        if (!files.length) {
            showToast('请至少选择一个 PDF 文件。', 'error');
            return;
        }

        try {
            setBusy(`正在导入 ${files.length} 篇 PDF…`);
            const pdfjsLib = await loadPdfJs();

            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                const metadata = await readPdfMetadata(pdf);
                const extractedText = await extractDocumentText(pdf, 30000);
                await pdf.destroy();

                const paper = {
                    id: makeId('paper'),
                    title: metadata.title || stripExtension(file.name),
                    fileName: file.name,
                    fileSize: file.size,
                    pageCount: metadata.pageCount,
                    groupId: '',
                    tagIds: [],
                    notes: '',
                    extractedText,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    lastReadPage: 1,
                    pdfBlob: new Blob([arrayBuffer], { type: file.type || 'application/pdf' })
                };

                await putRecord(STORES.papers, paper);
                state.selectedPaperId = paper.id;
            }

            await refreshState(state.selectedPaperId);
            renderAll();
            showToast(`已导入 ${files.length} 篇 PDF。`, 'success');
        } catch (error) {
            console.error(error);
            showToast(`导入 PDF 失败：${error.message}`, 'error');
        } finally {
            clearBusy();
        }
    }

    async function openReader(paperId) {
        const paper = findPaper(paperId);
        if (!paper) {
            showToast('找不到对应的文献。', 'error');
            return;
        }

        try {
            setBusy('正在打开 PDF 阅读器…');
            const pdfjsLib = await loadPdfJs();
            const arrayBuffer = await paper.pdfBlob.arrayBuffer();
            if (state.reader.pdf) {
                await state.reader.pdf.destroy();
            }
            state.reader.pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            state.reader.paperId = paper.id;
            state.reader.page = clamp(paper.lastReadPage || 1, 1, state.reader.pdf.numPages || 1);
            dom.readerTitle.textContent = paper.title;
            dom.readerNoteInput.value = paper.notes || '';
            dom.readerModal.classList.remove('hidden');
            dom.readerModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            await renderReaderPage();
        } catch (error) {
            console.error(error);
            showToast(`打开阅读器失败：${error.message}`, 'error');
        } finally {
            clearBusy();
        }
    }

    function closeReader() {
        if (state.reader.pdf) {
            Promise.resolve(state.reader.pdf.destroy()).catch(() => {});
        }
        state.reader.pdf = null;
        state.reader.paperId = '';
        state.reader.page = 1;
        dom.readerModal.classList.add('hidden');
        dom.readerModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        dom.readerCanvas.width = 0;
        dom.readerCanvas.height = 0;
    }

    async function renderReaderPage() {
        const paper = findPaper(state.reader.paperId);
        if (!paper || !state.reader.pdf) {
            return;
        }

        const page = await state.reader.pdf.getPage(state.reader.page);
        const viewport = page.getViewport({ scale: 1.18 });
        const canvas = dom.readerCanvas;
        const context = canvas.getContext('2d');
        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context.clearRect(0, 0, viewport.width, viewport.height);

        await page.render({
            canvasContext: context,
            viewport
        }).promise;

        dom.readerPageLabel.textContent = `第 ${state.reader.page} / ${state.reader.pdf.numPages} 页`;
        dom.readerMeta.innerHTML = `
            <div><strong>标题</strong><br>${escapeHTML(paper.title)}</div>
            <div><strong>文件</strong><br>${escapeHTML(paper.fileName)}</div>
            <div><strong>页数</strong><br>${paper.pageCount || state.reader.pdf.numPages}</div>
            <div><strong>分组</strong><br>${escapeHTML(getGroupName(paper.groupId) || '未分组')}</div>
            <div><strong>标签</strong><br>${escapeHTML(getTagNames(paper.tagIds).join(' / ') || '暂无')}</div>
            <div><strong>最近更新</strong><br>${escapeHTML(formatDateTime(paper.updatedAt))}</div>
        `;
        dom.readerPrevButton.disabled = state.reader.page <= 1;
        dom.readerNextButton.disabled = state.reader.page >= state.reader.pdf.numPages;

        await putRecord(STORES.papers, {
            ...paper,
            lastReadPage: state.reader.page,
            updatedAt: paper.updatedAt
        });
        await refreshState(state.reader.paperId);
        renderPaperDetail();
    }

    async function refreshState(preferredPaperId) {
        state.groups = (await getAll(STORES.groups)).sort((a, b) => safeLocale(a.name, b.name));
        state.tags = (await getAll(STORES.tags)).sort((a, b) => safeLocale(a.name, b.name));
        state.papers = (await getAll(STORES.papers)).sort((a, b) => {
            return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
        });

        if (preferredPaperId && findPaper(preferredPaperId)) {
            state.selectedPaperId = preferredPaperId;
        } else if (!findPaper(state.selectedPaperId)) {
            state.selectedPaperId = state.papers[0]?.id || '';
        }
    }

    function renderAll() {
        renderSummary();
        renderFilterOptions();
        renderFilterSummary();
        renderPaperList();
        renderPaperDetail();
        renderNotes();
        renderGroups();
        renderTags();
        renderBackupMeta();
    }

    function renderSummary() {
        const filtered = getFilteredPapers();
        const notedCount = state.papers.filter((paper) => paper.notes && paper.notes.trim()).length;
        const totalPages = state.papers.reduce((sum, paper) => sum + Number(paper.pageCount || 0), 0);
        dom.summaryStats.innerHTML = `
            ${renderSummaryCard('总文献数', state.papers.length, `${filtered.length} 篇符合当前筛选`)}
            ${renderSummaryCard('已写笔记', notedCount, '适合快速回看研究结论与 TODO')}
            ${renderSummaryCard('累计页数', totalPages, '基于上传 PDF 自动统计')}
        `;
    }

    function renderSummaryCard(title, value, description) {
        return `
            <article class="summary-card">
                <span>${escapeHTML(title)}</span>
                <strong>${escapeHTML(String(value))}</strong>
                <small>${escapeHTML(description)}</small>
            </article>
        `;
    }

    function renderFilterOptions() {
        const currentGroup = state.filters.groupId;
        const currentTag = state.filters.tagId;
        dom.groupFilter.innerHTML = `<option value="">全部分组</option>${state.groups.map((group) => `
            <option value="${escapeAttribute(group.id)}">${escapeHTML(group.name)}</option>
        `).join('')}`;
        dom.tagFilter.innerHTML = `<option value="">全部标签</option>${state.tags.map((tag) => `
            <option value="${escapeAttribute(tag.id)}">${escapeHTML(tag.name)}</option>
        `).join('')}`;
        dom.groupFilter.value = currentGroup;
        dom.tagFilter.value = currentTag;
    }

    function renderFilterSummary() {
        const filtered = getFilteredPapers();
        const parts = [];
        if (state.filters.keyword) {
            parts.push(`关键词“${state.filters.keyword}”`);
        }
        if (state.filters.groupId) {
            parts.push(`分组：${getGroupName(state.filters.groupId)}`);
        }
        if (state.filters.tagId) {
            parts.push(`标签：${getTagName(state.filters.tagId)}`);
        }
        dom.filterSummary.textContent = parts.length
            ? `当前筛选：${parts.join(' / ')}，共 ${filtered.length} 篇。`
            : `当前共 ${state.papers.length} 篇文献。`;
    }

    function renderPaperList() {
        const papers = getFilteredPapers();
        dom.paperListMeta.textContent = `共 ${papers.length} 篇文献，按最近更新排序。`;

        if (!papers.length) {
            dom.paperList.innerHTML = `
                <div class="empty-state">
                    <p>还没有符合条件的文献。</p>
                    <p>你可以先上传 PDF，或者清空筛选条件再看看。</p>
                </div>
            `;
            return;
        }

        dom.paperList.innerHTML = papers.map((paper) => {
            const tagNames = getTagNames(paper.tagIds);
            const excerpt = (paper.extractedText || '').slice(0, 150).trim();
            return `
                <article class="paper-card ${paper.id === state.selectedPaperId ? 'is-selected' : ''}" data-paper-card="${escapeAttribute(paper.id)}">
                    <div class="paper-card-head">
                        <div>
                            <h4>${escapeHTML(paper.title)}</h4>
                            <p>${escapeHTML(paper.fileName)}</p>
                        </div>
                        <button class="btn btn-secondary" type="button" data-action="open-reader" data-paper-id="${escapeAttribute(paper.id)}">阅读</button>
                    </div>
                    <div class="paper-meta-row">
                        <span>${paper.pageCount || 0} 页</span>
                        <span>${escapeHTML(getGroupName(paper.groupId) || '未分组')}</span>
                        <span>${escapeHTML(bytesToSize(paper.fileSize || 0))}</span>
                    </div>
                    <p>${escapeHTML(excerpt || '这篇 PDF 还没有可显示的文本摘要。')}</p>
                    <div class="tag-row">
                        ${tagNames.length ? tagNames.map((tagName) => renderTagChip(tagName, getTagColorByName(tagName))).join('') : '<span class="tag-chip">暂无标签</span>'}
                    </div>
                </article>
            `;
        }).join('');
    }

    function renderPaperDetail() {
        const paper = findPaper(state.selectedPaperId);
        if (!paper) {
            dom.paperDetail.className = 'paper-detail-empty';
            dom.paperDetail.innerHTML = '<p>还没有选中文献。上传或点击左侧文献卡片后，这里会显示详情。</p>';
            return;
        }

        dom.paperDetail.className = '';
        dom.paperDetail.innerHTML = `
            <form class="detail-form" data-paper-form="${escapeAttribute(paper.id)}">
                <label class="field">
                    <span>标题</span>
                    <input type="text" name="title" value="${escapeAttribute(paper.title)}" maxlength="180">
                </label>
                <label class="field">
                    <span>分组</span>
                    <select name="groupId">
                        <option value="">未分组</option>
                        ${state.groups.map((group) => `
                            <option value="${escapeAttribute(group.id)}" ${paper.groupId === group.id ? 'selected' : ''}>${escapeHTML(group.name)}</option>
                        `).join('')}
                    </select>
                </label>
                <div class="field">
                    <span>标签</span>
                    <div class="tag-checklist">
                        ${state.tags.length ? state.tags.map((tag) => `
                            <label class="tag-option">
                                <input type="checkbox" name="tagIds" value="${escapeAttribute(tag.id)}" ${Array.isArray(paper.tagIds) && paper.tagIds.includes(tag.id) ? 'checked' : ''}>
                                <span class="tag-chip-color" style="background:${escapeAttribute(tag.color || '#a45c40')}"></span>
                                ${escapeHTML(tag.name)}
                            </label>
                        `).join('') : '<span class="tag-chip">先在“标签与分组”区域创建标签</span>'}
                    </div>
                </div>
                <label class="field">
                    <span>笔记</span>
                    <textarea name="notes" rows="9" placeholder="记录实验设计、关键图表、复现思路、待验证结论">${escapeHTML(paper.notes || '')}</textarea>
                </label>
                <div class="detail-meta">
                    <div><strong>文件名：</strong>${escapeHTML(paper.fileName)}</div>
                    <div><strong>页数：</strong>${paper.pageCount || 0}</div>
                    <div><strong>文件大小：</strong>${escapeHTML(bytesToSize(paper.fileSize || 0))}</div>
                    <div><strong>创建时间：</strong>${escapeHTML(formatDateTime(paper.createdAt))}</div>
                    <div><strong>最近更新：</strong>${escapeHTML(formatDateTime(paper.updatedAt))}</div>
                    <div><strong>文本摘要：</strong>${escapeHTML(((paper.extractedText || '').slice(0, 240) || '暂无').trim())}</div>
                </div>
                <div class="detail-actions">
                    <button class="btn btn-primary" type="submit">保存改动</button>
                    <button class="btn btn-secondary" type="button" data-detail-action="open-reader" data-paper-id="${escapeAttribute(paper.id)}">打开阅读器</button>
                    <button class="btn btn-danger" type="button" data-detail-action="delete-paper" data-paper-id="${escapeAttribute(paper.id)}">删除文献</button>
                </div>
            </form>
        `;
    }

    function renderNotes() {
        const notedPapers = getFilteredPapers().filter((paper) => paper.notes && paper.notes.trim());
        if (!notedPapers.length) {
            dom.notesList.innerHTML = `
                <div class="empty-state">
                    <p>还没有符合条件的笔记。</p>
                    <p>打开一篇文献，写下阅读笔记后，这里就会自动出现。</p>
                </div>
            `;
            return;
        }

        dom.notesList.innerHTML = notedPapers.map((paper) => `
            <article class="note-card">
                <div class="note-card-head">
                    <div>
                        <h4>${escapeHTML(paper.title)}</h4>
                        <p>${escapeHTML(getGroupName(paper.groupId) || '未分组')} · ${paper.pageCount || 0} 页</p>
                    </div>
                </div>
                <p>${escapeHTML(trimToLength(paper.notes, 220))}</p>
                <div class="tag-row">
                    ${getTagNames(paper.tagIds).length ? getTagNames(paper.tagIds).map((tagName) => renderTagChip(tagName, getTagColorByName(tagName))).join('') : '<span class="tag-chip">暂无标签</span>'}
                </div>
                <div class="note-card-actions">
                    <button class="btn btn-secondary" type="button" data-notes-action="focus-detail" data-paper-id="${escapeAttribute(paper.id)}">查看详情</button>
                    <button class="btn btn-primary" type="button" data-notes-action="open-reader" data-paper-id="${escapeAttribute(paper.id)}">继续阅读</button>
                </div>
            </article>
        `).join('');
    }

    function renderGroups() {
        if (!state.groups.length) {
            dom.groupList.innerHTML = '<div class="empty-state"><p>还没有分组。你可以按项目、疾病或实验方向创建。</p></div>';
            return;
        }

        dom.groupList.innerHTML = state.groups.map((group) => {
            const count = state.papers.filter((paper) => paper.groupId === group.id).length;
            return `
                <article class="manager-item">
                    <div class="manager-item-head">
                        <div>
                            <strong>${escapeHTML(group.name)}</strong>
                            <p>${escapeHTML(group.description || '暂无说明')}</p>
                        </div>
                        <div class="manager-item-actions">
                            <button class="btn btn-secondary" type="button" data-group-action="edit" data-group-id="${escapeAttribute(group.id)}">编辑</button>
                            <button class="btn btn-danger" type="button" data-group-action="delete" data-group-id="${escapeAttribute(group.id)}">删除</button>
                        </div>
                    </div>
                    <div class="manager-item-meta">${count} 篇文献正在使用这个分组</div>
                </article>
            `;
        }).join('');
    }

    function renderTags() {
        if (!state.tags.length) {
            dom.tagList.innerHTML = '<div class="empty-state"><p>还没有标签。你可以按方法、数据类型、复现状态来创建。</p></div>';
            return;
        }

        dom.tagList.innerHTML = state.tags.map((tag) => {
            const count = state.papers.filter((paper) => Array.isArray(paper.tagIds) && paper.tagIds.includes(tag.id)).length;
            return `
                <article class="manager-item">
                    <div class="manager-item-head">
                        <div>
                            <strong>${renderTagChip(tag.name, tag.color)}</strong>
                            <p>颜色：${escapeHTML(tag.color || '#a45c40')}</p>
                        </div>
                        <div class="manager-item-actions">
                            <button class="btn btn-secondary" type="button" data-tag-action="edit" data-tag-id="${escapeAttribute(tag.id)}">编辑</button>
                            <button class="btn btn-danger" type="button" data-tag-action="delete" data-tag-id="${escapeAttribute(tag.id)}">删除</button>
                        </div>
                    </div>
                    <div class="manager-item-meta">${count} 篇文献带有这个标签</div>
                </article>
            `;
        }).join('');
    }

    function renderBackupMeta() {
        const totalBytes = state.papers.reduce((sum, paper) => sum + Number(paper.fileSize || 0), 0);
        dom.backupMeta.innerHTML = `
            当前本地数据：<strong>${state.papers.length}</strong> 篇文献，
            <strong>${state.groups.length}</strong> 个分组，
            <strong>${state.tags.length}</strong> 个标签，
            约 <strong>${escapeHTML(bytesToSize(totalBytes))}</strong> PDF 数据。
        `;
    }

    function getFilteredPapers() {
        const keyword = normalizeText(state.filters.keyword);
        return state.papers.filter((paper) => {
            if (state.filters.groupId && paper.groupId !== state.filters.groupId) {
                return false;
            }

            if (state.filters.tagId && (!Array.isArray(paper.tagIds) || !paper.tagIds.includes(state.filters.tagId))) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            const searchField = normalizeText([
                paper.title,
                paper.fileName,
                paper.notes,
                paper.extractedText,
                getGroupName(paper.groupId),
                getTagNames(paper.tagIds).join(' ')
            ].join(' '));

            return searchField.includes(keyword);
        });
    }

    function getGroupName(groupId) {
        if (!groupId) {
            return '';
        }
        return state.groups.find((group) => group.id === groupId)?.name || '';
    }

    function getTagName(tagId) {
        return state.tags.find((tag) => tag.id === tagId)?.name || '';
    }

    function getTagNames(tagIds) {
        if (!Array.isArray(tagIds)) {
            return [];
        }
        return tagIds.map(getTagName).filter(Boolean);
    }

    function getTagColorByName(name) {
        return state.tags.find((tag) => tag.name === name)?.color || '#a45c40';
    }

    function renderTagChip(name, color) {
        return `
            <span class="tag-chip">
                <span class="tag-chip-color" style="background:${escapeAttribute(color || '#a45c40')}"></span>
                ${escapeHTML(name)}
            </span>
        `;
    }

    function findPaper(paperId) {
        return state.papers.find((paper) => paper.id === paperId);
    }

    function setBusy(message) {
        dom.busyMessage.textContent = message || '处理中…';
        dom.busyOverlay.classList.remove('hidden');
    }

    function clearBusy() {
        dom.busyOverlay.classList.add('hidden');
    }

    function showToast(message, type) {
        if (toastTimer) {
            window.clearTimeout(toastTimer);
        }
        const toast = document.createElement('div');
        toast.className = `toast toast-${type || 'info'}`;
        toast.textContent = message;
        dom.toastRegion.innerHTML = '';
        dom.toastRegion.appendChild(toast);
        toastTimer = window.setTimeout(() => {
            toast.remove();
        }, 3200);
    }

    async function restoreBackup(snapshot) {
        validateSnapshot(snapshot);
        const confirmed = window.confirm('导入备份会替换当前浏览器中的现有文献库，是否继续？');
        if (!confirmed) {
            return;
        }

        await clearStore(STORES.papers);
        await clearStore(STORES.groups);
        await clearStore(STORES.tags);

        for (const group of snapshot.groups) {
            await putRecord(STORES.groups, group);
        }
        for (const tag of snapshot.tags) {
            await putRecord(STORES.tags, tag);
        }
        for (const paper of snapshot.papers) {
            const restoredPaper = { ...paper };
            if (paper.pdfDataUrl) {
                restoredPaper.pdfBlob = dataURLToBlob(paper.pdfDataUrl);
            } else if (!paper.pdfBlob) {
                restoredPaper.pdfBlob = new Blob([], { type: 'application/pdf' });
            }
            delete restoredPaper.pdfDataUrl;
            await putRecord(STORES.papers, restoredPaper);
        }
    }

    function validateSnapshot(snapshot) {
        if (!snapshot || typeof snapshot !== 'object') {
            throw new Error('备份文件格式无效。');
        }
        if (!Array.isArray(snapshot.groups) || !Array.isArray(snapshot.tags) || !Array.isArray(snapshot.papers)) {
            throw new Error('备份文件缺少必要的数据数组。');
        }
    }

    async function loadPdfJs() {
        if (pdfjsPromise) {
            return pdfjsPromise;
        }
        pdfjsPromise = import(PDFJS_URL).then((module) => {
            module.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
            return module;
        }).catch((error) => {
            pdfjsPromise = null;
            throw error;
        });
        return pdfjsPromise;
    }

    async function readPdfMetadata(pdf) {
        let title = '';
        try {
            const metadata = await pdf.getMetadata();
            title = String(metadata?.info?.Title || '').trim();
        } catch (error) {
            title = '';
        }
        return {
            title,
            pageCount: pdf.numPages || 0
        };
    }

    async function extractDocumentText(pdf, limit) {
        const chunks = [];
        let currentLength = 0;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            const page = await pdf.getPage(pageNumber);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => item.str || '').join(' ').replace(/\s+/g, ' ').trim();
            if (pageText) {
                const remaining = Math.max(0, limit - currentLength);
                chunks.push(pageText.slice(0, remaining));
                currentLength += pageText.length;
            }
            if (currentLength >= limit) {
                break;
            }
        }

        return chunks.join(' ').trim();
    }

    function openDatabase() {
        if (!('indexedDB' in window)) {
            return Promise.reject(new Error('当前浏览器不支持 IndexedDB。'));
        }
        if (dbPromise) {
            return dbPromise;
        }

        dbPromise = new Promise((resolve, reject) => {
            const request = window.indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => reject(request.error || new Error('打开数据库失败。'));
            request.onupgradeneeded = () => {
                const database = request.result;
                Object.values(STORES).forEach((storeName) => {
                    if (!database.objectStoreNames.contains(storeName)) {
                        database.createObjectStore(storeName, { keyPath: 'id' });
                    }
                });
            };
            request.onsuccess = () => resolve(request.result);
        });

        return dbPromise;
    }

    async function getAll(storeName) {
        const database = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(storeName, 'readonly');
            const request = transaction.objectStore(storeName).getAll();
            request.onerror = () => reject(request.error || new Error('读取数据失败。'));
            request.onsuccess = () => resolve(request.result || []);
        });
    }

    async function putRecord(storeName, value) {
        const database = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(storeName, 'readwrite');
            const request = transaction.objectStore(storeName).put(value);
            request.onerror = () => reject(request.error || new Error('写入数据失败。'));
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error || new Error('写入事务失败。'));
        });
    }

    async function deleteRecord(storeName, id) {
        const database = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(storeName, 'readwrite');
            const request = transaction.objectStore(storeName).delete(id);
            request.onerror = () => reject(request.error || new Error('删除数据失败。'));
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error || new Error('删除事务失败。'));
        });
    }

    async function clearStore(storeName) {
        const database = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(storeName, 'readwrite');
            const request = transaction.objectStore(storeName).clear();
            request.onerror = () => reject(request.error || new Error('清空数据失败。'));
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error || new Error('清空事务失败。'));
        });
    }

    function blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(reader.error || new Error('读取文件失败。'));
            reader.onload = () => resolve(String(reader.result || ''));
            reader.readAsDataURL(blob);
        });
    }

    function dataURLToBlob(dataUrl) {
        const parts = dataUrl.split(',');
        if (parts.length !== 2) {
            throw new Error('备份中的 PDF 数据格式无效。');
        }
        const mimeMatch = parts[0].match(/data:(.*?);base64/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const binary = window.atob(parts[1]);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
            bytes[index] = binary.charCodeAt(index);
        }
        return new Blob([bytes], { type: mimeType });
    }

    function normalizeText(value) {
        return String(value || '').trim().toLowerCase();
    }

    function stripExtension(fileName) {
        return String(fileName || '').replace(/\.[^.]+$/, '');
    }

    function trimToLength(value, limit) {
        const text = String(value || '').trim();
        if (text.length <= limit) {
            return text;
        }
        return `${text.slice(0, limit).trim()}…`;
    }

    function bytesToSize(bytes) {
        if (!bytes) {
            return '0 B';
        }
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex += 1;
        }
        return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
    }

    function formatDateTime(value) {
        if (!value) {
            return '未知';
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '未知';
        }
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    function formatDateForFilename(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        return `${year}${month}${day}-${hour}${minute}`;
    }

    function safeLocale(left, right) {
        return String(left || '').localeCompare(String(right || ''), 'zh-CN');
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function makeId(prefix) {
        if (window.crypto?.randomUUID) {
            return `${prefix}-${window.crypto.randomUUID()}`;
        }
        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function escapeHTML(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttribute(value) {
        return escapeHTML(value);
    }
}());
