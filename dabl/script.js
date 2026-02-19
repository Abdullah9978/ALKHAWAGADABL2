// 1. إدارة البيانات (تحميل من الذاكرة أو إنشاء بيانات فارغة)
let db = JSON.parse(localStorage.getItem('glassDB')) || { sticks: [], decos: [] };

// 2. تحديث الشاشة عند بدء التشغيل
document.addEventListener('DOMContentLoaded', () => {
    renderLists();
    updateSelects();
    
    // ربط زر التبديل بين الصفحات
    document.getElementById('btnCalc').onclick = () => showPage('calcPage');
    document.getElementById('btnManage').onclick = () => showPage('managePage');
});

// 3. التنقل بين الصفحات
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    
    document.querySelectorAll('.main-nav button').forEach(b => b.classList.remove('active'));
    if(pageId === 'calcPage') document.getElementById('btnCalc').classList.add('active');
    if(pageId === 'managePage') document.getElementById('btnManage').classList.add('active');
}

// 4. إضافة خامات جديدة (عواد أو ورد)
function addItem(type) {
    if (type === 'sticks') {
        const nameInput = document.getElementById('newStickName');
        const widthInput = document.getElementById('newStickWidth');
        
        if (nameInput.value === "" || widthInput.value === "") {
            alert("من فضلك أدخل اسم العود وعرضه");
            return;
        }
        
        db.sticks.push({
            id: Date.now(),
            name: nameInput.value,
            val: parseFloat(widthInput.value)
        });
        
        nameInput.value = ""; widthInput.value = "";
    } 
    else if (type === 'decos') {
        const nameInput = document.getElementById('newDecoName');
        const wInput = document.getElementById('newDecoW');
        const hInput = document.getElementById('newDecoH');
        
        if (nameInput.value === "" || wInput.value === "" || hInput.value === "") {
            alert("من فضلك أكمل بيانات الوردة");
            return;
        }
        
        db.decos.push({
            id: Date.now(),
            name: nameInput.value,
            w: parseFloat(wInput.value),
            h: parseFloat(hInput.value)
        });
        
        nameInput.value = ""; wInput.value = ""; hInput.value = "";
    }
    
    saveAndRefresh();
}

// 5. حذف خامة
function deleteItem(type, id) {
    if(confirm("هل أنت متأكد من الحذف؟")) {
        db[type] = db[type].filter(item => item.id !== id);
        saveAndRefresh();
    }
}

// 6. حفظ وتحديث الواجهات
function saveAndRefresh() {
    localStorage.setItem('glassDB', JSON.stringify(db));
    renderLists();
    updateSelects();
}

function renderLists() {
    // عرض قائمة العيدان
    const sList = document.getElementById('sticksList');
    sList.innerHTML = db.sticks.map(s => `
        <li>
            <span>${s.name} (${s.val} سم)</span>
            <button class="btn-del" onclick="deleteItem('sticks', ${s.id})"><i class="fa-solid fa-trash"></i></button>
        </li>
    `).join('');

    // عرض قائمة الورد
    const dList = document.getElementById('decosList');
    dList.innerHTML = db.decos.map(d => `
        <li>
            <span>${d.name} (${d.w}×${d.h} سم)</span>
            <button class="btn-del" onclick="deleteItem('decos', ${d.id})"><i class="fa-solid fa-trash"></i></button>
        </li>
    `).join('');
}

function updateSelects() {
    const sSelect = document.getElementById('selectStick');
    const dSelect = document.getElementById('selectDeco');

    if (db.sticks.length > 0) {
        sSelect.innerHTML = db.sticks.map(s => `<option value="${s.val}">${s.name}</option>`).join('');
    } else {
        sSelect.innerHTML = `<option value="">لا يوجد عواد مضافة</option>`;
    }

    if (db.decos.length > 0) {
        dSelect.innerHTML = db.decos.map(d => `<option value="${d.w},${d.h}">${d.name}</option>`).join('');
    } else {
        dSelect.innerHTML = `<option value="">لا يوجد ورد مضاف</option>`;
    }
}

// 7. دالة الحساب المحدثة (التي طلبتها سابقاً)
function calculate() {
    const H = parseFloat(document.getElementById('glassHeight').value);
    const W = parseFloat(document.getElementById('glassWidth').value);
    const hLines = parseInt(document.getElementById('hLines').value) || 0;
    const vLines = parseInt(document.getElementById('vLines').value) || 0;
    const stickW = parseFloat(document.getElementById('selectStick').value) || 0;
    const hasDeco = document.getElementById('hasDecoration').checked;
    
    if (!H || !W) { alert("أدخل مقاس الزجاج"); return; }

    let netH = H - 2;
    let netW = W - 2;
    let finalPieceH, finalPieceW;

    if (hasDeco) {
        let decoVal = document.getElementById('selectDeco').value;
        if (!decoVal || decoVal.indexOf(',') === -1) { alert("اختر نوع الورد أولاً"); return; }
        let [dW, dH] = decoVal.split(',');
        finalPieceW = (netW - (vLines * parseFloat(dW))) / (vLines + 1);
        finalPieceH = (netH - (hLines * parseFloat(dH))) / (hLines + 1);
    } else {
        finalPieceW = (netW - (vLines * stickW)) / (vLines + 1);
        finalPieceH = (netH - (hLines * stickW)) / (hLines + 1);
    }

    // عرض النتائج
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('resultsContent').innerHTML = `
        <div class="res-card">
            <div class="res-item"><span>قطع الطول:</span> <strong>${vLines * (hLines + 1)} قطعة × ${finalPieceH.toFixed(2)} سم</strong></div>
            <div class="res-item"><span>قطع العرض:</span> <strong>${hLines * (vLines + 1)} قطعة × ${finalPieceW.toFixed(2)} سم</strong></div>
            <div class="res-item"><span>عدد الورد:</span> <strong>${vLines * hLines} وردة</strong></div>
        </div>
    `;
    
    drawGlass(W, H, vLines, hLines);
}

// دالة تفعيل/تعطيل قائمة الورد
function toggleDecoSelect() {
    document.getElementById('selectDeco').disabled = !document.getElementById('hasDecoration').checked;
}

// دالة الرسم (Canvas)
function drawGlass(W, H, v, h) {
    const canvas = document.getElementById('glassCanvas');
    const ctx = canvas.getContext('2d');
    document.getElementById('canvasContainer').classList.remove('hidden');
    canvas.width = 300;
    canvas.height = (H / W) * 300;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1a237e";
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    for (let i = 1; i <= v; i++) {
        let x = (canvas.width - 10) / (v + 1) * i + 5;
        ctx.moveTo(x, 5); ctx.lineTo(x, canvas.height - 5);
    }
    for (let j = 1; j <= h; j++) {
        let y = (canvas.height - 10) / (h + 1) * j + 5;
        ctx.moveTo(5, y); ctx.lineTo(canvas.width - 5, y);
    }
    ctx.stroke();
}