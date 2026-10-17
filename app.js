/* =========================================================
   QUẢN LÝ QUÁN ĂN - JavaScript
   - Dữ liệu lưu LocalStorage
   - CRUD demo cho món ăn / đơn hàng / chi tiêu
   - Dashboard tự tính doanh thu, chi tiêu, lợi nhuận
   - Tìm kiếm + lọc + đổi trạng thái đơn
   ========================================================= */

const STORAGE = {
  orders: "qa_orders_v2",
  foods: "qa_foods_v2",
  expenses: "qa_expenses_v2",
  tables: "qa_tables_v1"
};

const seedFoods = [
  {id:"M01", name:"Mì Quảng", category:"Món chính", price:35000, sold:42, icon:"🍜"},
  {id:"M02", name:"Bún", category:"Món chính", price:30000, sold:38, icon:"🍲"},
  {id:"M03", name:"Bánh ướt", category:"Món chính", price:25000, sold:31, icon:"🥢"},
  {id:"M04", name:"Bánh mì heo quay", category:"Bánh mì", price:25000, sold:27, icon:"🥖"},
  {id:"M05", name:"Bánh mì bò kho", category:"Bánh mì", price:30000, sold:19, icon:"🍛"},
  {id:"M06", name:"Sữa đậu nành", category:"Đồ uống", price:5000, sold:24, icon:"🥛"}
];

const seedTables = Array.from({length:7}, (_,i)=>({id:i+1,name:`Bàn ${i+1}`,seats:4}));

const seedOrders = [
  {id:"#1025", table:1, customer:"Nguyễn Văn A", food:"Cơm gà", qty:2, total:90000, status:"Hoàn thành", createdAt:"2026-10-07"},
  {id:"#1024", table:2, customer:"Trần Minh", food:"Cơm sườn", qty:1, total:40000, status:"Hoàn thành", createdAt:"2026-10-07"},
  {id:"#1023", table:3, customer:"Lê Hoàng", food:"Mì Quảng", qty:2, total:70000, status:"Đang làm", createdAt:"2026-10-07"},
  {id:"#1022", table:4, customer:"Phạm An", food:"Bún", qty:1, total:30000, status:"Chờ xử lý", createdAt:"2026-10-07"},
  {id:"#1021", table:5, customer:"Mai Linh", food:"Bánh ướt", qty:3, total:75000, status:"Hoàn thành", createdAt:"2026-10-06"}
];

const seedExpenses = [
  {id:1, name:"Mua thịt heo", category:"Nguyên liệu", amount:450000, date:"2026-10-07"},
  {id:2, name:"Rau, gia vị", category:"Nguyên liệu", amount:170000, date:"2026-10-07"},
  {id:3, name:"Tiền điện", category:"Điện nước", amount:120000, date:"2026-10-06"},
  {id:4, name:"Gas bếp", category:"Khác", amount:90000, date:"2026-10-05"}
];

let foods = load(STORAGE.foods, seedFoods);
let orders = load(STORAGE.orders, seedOrders);
let expenses = load(STORAGE.expenses, seedExpenses);
let tables = load(STORAGE.tables, seedTables);

const pages = {
  dashboard:{title:"Tổng quan hôm nay",sub:"Theo dõi tình hình kinh doanh của quán"},
  orders:{title:"Đơn hàng",sub:"Quản lý tất cả đơn hàng của quán"},
  tables:{title:"Bàn ăn",sub:"Quản lý 7 bàn của quán"},
  foods:{title:"Món ăn",sub:"Quản lý thực đơn và giá bán"},
  customers:{title:"Khách hàng",sub:"Thông tin và lịch sử mua hàng"},
  expenses:{title:"Chi tiêu",sub:"Theo dõi các khoản chi của quán"},
  revenue:{title:"Doanh thu",sub:"Theo dõi doanh thu theo thời gian"},
  reports:{title:"Báo cáo",sub:"Tổng hợp tình hình kinh doanh"},
  settings:{title:"Cài đặt",sub:"Thiết lập hệ thống quản lý"}
};

const content = document.getElementById("content");
const todayEl = document.getElementById("today");
todayEl.textContent = new Date().toLocaleDateString("vi-VN");

function load(key, fallback){
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
}
function save(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function money(n){ return Number(n || 0).toLocaleString("vi-VN") + "đ"; }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function esc(value){
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
}
function toast(message, type="success"){
  let box=document.getElementById("toastBox");
  if(!box){box=document.createElement("div");box.id="toastBox";document.body.appendChild(box);}
  const item=document.createElement("div"); item.className=`toast ${type}`; item.textContent=message; box.appendChild(item);
  setTimeout(()=>item.classList.add("show"),10);
  setTimeout(()=>{item.classList.remove("show");setTimeout(()=>item.remove(),250)},2600);
}

function stat(icon,label,value,trend,cls="up"){
  return `<div class="stat"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><span class="trend ${cls}">${trend}</span></div>`;
}

function getRevenue(){ return orders.filter(o=>o.status!=="Đã hủy").reduce((s,o)=>s+Number(o.total),0); }
function getExpense(){ return expenses.reduce((s,e)=>s+Number(e.amount),0); }
function getProfit(){ return getRevenue()-getExpense(); }
function getCompletedOrders(){ return orders.filter(o=>o.status==="Hoàn thành").length; }

function chart(){
  const points=[30,120,85,150,65,105,45];
  const max=Math.max(...points), min=Math.min(...points);
  const coords=points.map((v,i)=>`${i*116},${190-(v-min)/(max-min)*135}`);
  return `<div class="chart"><svg viewBox="0 0 696 220" preserveAspectRatio="none">
    <g stroke="#edf0f4" stroke-width="1">${[35,80,125,170,215].map(y=>`<line x1="0" y1="${y}" x2="696" y2="${y}"/>`).join("")}</g>
    <polyline fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" points="${coords.join(" ")}"/>
    <g fill="#f59e0b">${points.map((v,i)=>`<circle cx="${i*116}" cy="${190-(v-min)/(max-min)*135}" r="4"/>`).join("")}</g>
  </svg><div class="chart-labels"><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span></div></div>`;
}

function statusClass(status){ return status==="Hoàn thành"?"green":status==="Đang làm"?"orange":"red"; }
function orderRow(o){
  return `<div class="order-row"><div class="order-info"><strong>${esc(o.id)} · Bàn ${o.table||"-"} · ${esc(o.food)}</strong><small>${esc(o.customer)} · SL: ${o.qty}</small></div><div><div class="price">${money(o.total)}</div><span class="badge ${statusClass(o.status)}">${esc(o.status)}</span></div></div>`;
}

function dashboard(){
  const revenue=getRevenue(), expense=getExpense(), profit=getProfit();
  const avg=orders.length?Math.round(revenue/orders.length):0;
  const topFoods=[...foods].sort((a,b)=>b.sold-a.sold).slice(0,5);
  content.innerHTML=`
    <div class="cards">
      ${stat("💰","Doanh thu",money(revenue),"Tự động tính từ đơn hàng","up")}
      ${stat("💸","Chi tiêu",money(expense),"Từ sổ chi tiêu","down")}
      ${stat("📈","Lợi nhuận",money(profit),profit>=0?"Doanh thu - chi tiêu":"Đang âm","up")}
      ${stat("🧾","Đơn hàng",orders.length,`${getCompletedOrders()} đơn hoàn thành`,"up")}
    </div>
    <div class="panel table-summary-panel"><div class="panel-head"><h3>Tình trạng bàn</h3><button class="btn" data-go="tables">Quản lý 7 bàn</button></div><div class="table-mini-grid">${tables.map(t=>tableMini(t)).join("")}</div></div>
    <div class="grid-2">
      <div class="panel"><div class="panel-head"><h3>Biểu đồ doanh thu</h3><span class="muted">7 ngày gần đây</span></div>${chart()}</div>
      <div class="panel"><div class="panel-head"><h3>Đơn hàng gần đây</h3><button class="btn" data-go="orders">Xem tất cả</button></div><div class="orders-list">${orders.slice(0,4).map(orderRow).join("")}</div></div>
    </div>
    <div class="grid-2">
      <div class="panel"><div class="panel-head"><h3>Món bán chạy</h3><span class="muted">Hôm nay</span></div>${topFoods.map((f,i)=>`<div class="order-row"><div class="order-info"><strong>${i+1}. ${f.icon} ${esc(f.name)}</strong><small>${f.sold} phần đã bán</small></div><span class="price">${money(f.price)}</span></div>`).join("")}</div>
      <div class="panel"><div class="panel-head"><h3>Chỉ số nhanh</h3><span class="muted">Đơn TB: ${money(avg)}</span></div>
        <div class="mini-grid"><div><span class="muted">Khách hàng</span><div class="big-number">${new Set(orders.map(o=>o.customer)).size}</div><div class="progress"><span style="width:72%"></span></div></div>
        <div><span class="muted">Đơn hoàn thành</span><div class="big-number">${getCompletedOrders()}</div><div class="progress"><span style="width:${orders.length?Math.min(100,getCompletedOrders()/orders.length*100):0}%"></span></div></div>
        <div><span class="muted">Lợi nhuận</span><div class="big-number">${money(profit)}</div><div class="progress"><span style="width:${revenue?Math.max(0,Math.min(100,profit/revenue*100)):0}%"></span></div></div>
        <div><span class="muted">Món đang bán</span><div class="big-number">${foods.length}</div><div class="progress"><span style="width:80%"></span></div></div></div>
      </div>
    </div>`;
}

function ordersPage(){
  content.innerHTML=`<div class="section-title"><div><h2>Danh sách đơn hàng</h2><span class="muted">${orders.length} đơn trong hệ thống</span></div><button class="primary" data-action="open-order">＋ Tạo đơn hàng</button></div>
    <div class="toolbar"><input class="search" id="orderSearch" placeholder="🔎 Tìm mã đơn, khách hàng, món ăn..."/><select class="btn" id="statusFilter"><option value="">Tất cả trạng thái</option><option>Hoàn thành</option><option>Đang làm</option><option>Chờ xử lý</option><option>Đã hủy</option></select></div>
    <div class="table-wrap"><table class="table"><thead><tr><th>MÃ ĐƠN</th><th>BÀN</th><th>KHÁCH HÀNG</th><th>MÓN</th><th>SL</th><th>TỔNG TIỀN</th><th>TRẠNG THÁI</th><th></th></tr></thead><tbody id="ordersBody"></tbody></table></div>`;
  renderOrders();
  document.getElementById("orderSearch").addEventListener("input", debounce(renderOrders,150));
  document.getElementById("statusFilter").addEventListener("change",renderOrders);
}
function renderOrders(){
  const q=(document.getElementById("orderSearch")?.value||"").toLowerCase().trim();
  const status=document.getElementById("statusFilter")?.value||"";
  const rows=orders.filter(o=>`${o.id} ${o.customer} ${o.food}`.toLowerCase().includes(q) && (!status||o.status===status));
  document.getElementById("ordersBody").innerHTML=rows.length?rows.map(o=>`<tr><td><strong>${esc(o.id)}</strong></td><td><strong>Bàn ${o.table||"-"}</strong></td><td>${esc(o.customer)}</td><td class="food-name">${esc(o.food)}</td><td>${o.qty}</td><td class="food-price">${money(o.total)}</td><td><button class="badge ${statusClass(o.status)} status-btn" data-id="${esc(o.id)}">${esc(o.status)}</button></td><td><button class="btn danger-btn" data-delete-order="${esc(o.id)}">Xóa</button></td></tr>`).join(""):`<tr><td colspan="8" class="empty">Không tìm thấy đơn hàng.</td></tr>`;
}

function getTableStatus(tableId){
  const active=orders.some(o=>Number(o.table)===Number(tableId) && o.status!=="Hoàn thành" && o.status!=="Đã hủy");
  return active ? "Có khách" : "Trống";
}
function tableMini(t){
  const status=getTableStatus(t.id);
  const cls=status==="Trống"?"free":"busy";
  return `<button class="table-mini ${cls}" data-table-go="${t.id}"><span class="table-no">${t.id}</span><span>${esc(t.name)}</span><small>${status}</small></button>`;
}
function tablesPage(){
  const free=tables.filter(t=>getTableStatus(t.id)==="Trống").length;
  const busy=tables.length-free;
  content.innerHTML=`<div class="section-title"><div><h2>Quản lý bàn ăn</h2><span class="muted">Quán có ${tables.length} bàn · ${free} bàn trống · ${busy} bàn đang có khách</span></div><button class="primary" data-action="open-order">＋ Tạo đơn</button></div>
    <div class="table-status-bar"><span><i class="dot free-dot"></i> Trống: <strong>${free}</strong></span><span><i class="dot busy-dot"></i> Có khách: <strong>${busy}</strong></span></div>
    <div class="table-grid">${tables.map(t=>{
      const status=getTableStatus(t.id); const cls=status==="Trống"?"free":"busy";
      const tableOrders=orders.filter(o=>Number(o.table)===t.id && o.status!=="Đã hủy");
      const total=tableOrders.filter(o=>o.status!=="Hoàn thành").reduce((s,o)=>s+Number(o.total),0);
      return `<div class="restaurant-table ${cls}"><div class="table-card-head"><div class="table-number">${t.id}</div><div><strong>${esc(t.name)}</strong><small>${t.seats} chỗ ngồi</small></div><span class="table-status ${cls}">${status}</span></div><div class="table-card-body"><div><span class="muted">Đơn đang mở</span><strong>${tableOrders.filter(o=>o.status!=="Hoàn thành").length}</strong></div><div><span class="muted">Tạm tính</span><strong>${money(total)}</strong></div></div><div class="table-actions"><button class="btn" data-table-go="${t.id}">${status==="Trống"?"Gọi món":"Xem đơn"}</button>${status!=="Trống"?`<button class="btn" data-action="clear-table" data-table-id="${t.id}">Thanh toán / dọn bàn</button>`:""}</div></div>`;
    }).join("")}</div>`;
}

function foodsPage(){
  content.innerHTML=`<div class="section-title"><div><h2>Thực đơn</h2><span class="muted">${foods.length} món đang kinh doanh</span></div><button class="primary" data-action="add-food">＋ Thêm món</button></div>
    <div class="toolbar"><input class="search" id="foodSearch" placeholder="🔎 Tìm món ăn..."/><select class="btn" id="foodCategory"><option value="">Tất cả nhóm</option><option>Món chính</option><option>Bánh mì</option><option>Đồ uống</option></select></div>
    <div class="page-grid" id="foodGrid"></div>`;
  renderFoods();
  document.getElementById("foodSearch").addEventListener("input",debounce(renderFoods,150));
  document.getElementById("foodCategory").addEventListener("change",renderFoods);
}
function renderFoods(){
  const q=(document.getElementById("foodSearch")?.value||"").toLowerCase(); const cat=document.getElementById("foodCategory")?.value||"";
  const list=foods.filter(f=>f.name.toLowerCase().includes(q)&&(!cat||f.category===cat));
  document.getElementById("foodGrid").innerHTML=list.length?list.map(f=>`<div class="food-card"><div class="food-img">${f.icon}</div><div class="food-body"><h3>${esc(f.name)}</h3><p>${esc(f.category)} · Đã bán ${f.sold} phần</p><div class="food-bottom"><span class="amount">${money(f.price)}</span><span><button class="btn" data-edit-food="${f.id}">Sửa</button> <button class="btn danger-btn" data-delete-food="${f.id}">Xóa</button></span></div></div></div>`).join(""):`<div class="empty">Không có món phù hợp.</div>`;
}

function customersPage(){
  const map={};
  orders.forEach(o=>{if(!map[o.customer])map[o.customer]={orders:0,total:0};if(o.status!=="Đã hủy"){map[o.customer].orders++;map[o.customer].total+=o.total;}});
  const cs=Object.entries(map).sort((a,b)=>b[1].total-a[1].total);
  content.innerHTML=`<div class="section-title"><div><h2>Khách hàng</h2><span class="muted">${cs.length} khách hàng từ dữ liệu đơn hàng</span></div><button class="primary" data-action="add-customer">＋ Thêm khách hàng</button></div><div class="table-wrap"><table class="table"><thead><tr><th>KHÁCH HÀNG</th><th>SỐ ĐƠN</th><th>TỔNG CHI TIÊU</th><th>HẠNG</th></tr></thead><tbody>${cs.map(([name,c])=>`<tr><td><strong>${esc(name)}</strong></td><td>${c.orders}</td><td class="food-price">${money(c.total)}</td><td>${c.total>=1000000?"⭐ VIP":c.total>=500000?"Thân thiết":"Thường"}</td></tr>`).join("")||`<tr><td colspan="4" class="empty">Chưa có khách hàng.</td></tr>`}</tbody></table></div>`;
}

function expensesPage(){
  const total=getExpense();
  const byCat={}; expenses.forEach(e=>byCat[e.category]=(byCat[e.category]||0)+e.amount);
  content.innerHTML=`<div class="cards">${Object.entries(byCat).slice(0,4).map(([cat,v],i)=>stat(["🛒","🏠","⚡","📦"][i]||"💸",cat,money(v),`${total?Math.round(v/total*100):0}% tổng chi`,"down")).join("")}</div>
  <div class="panel" style="margin-top:18px"><div class="panel-head"><h3>Các khoản chi gần đây</h3><button class="primary" data-action="add-expense">＋ Thêm khoản chi</button></div>
  <div class="table-wrap"><table class="table"><thead><tr><th>NỘI DUNG</th><th>NHÓM</th><th>NGÀY</th><th>SỐ TIỀN</th><th></th></tr></thead><tbody>${expenses.map(e=>`<tr><td><strong>💸 ${esc(e.name)}</strong></td><td>${esc(e.category)}</td><td>${formatDate(e.date)}</td><td class="food-price">${money(e.amount)}</td><td><button class="btn danger-btn" data-delete-expense="${e.id}">Xóa</button></td></tr>`).join("")}</tbody></table></div></div>`;
}

function revenuePage(){
  const revenue=getRevenue(), avg=orders.length?revenue/orders.length:0;
  content.innerHTML=`<div class="cards">${stat("💰","Doanh thu hôm nay",money(revenue),"Từ đơn hàng","up")}${stat("📅","Doanh thu tháng",money(revenue),"Demo dữ liệu hiện tại","up")}${stat("🧾","Tổng đơn",orders.length,`${getCompletedOrders()} đơn hoàn thành`,"up")}${stat("🧮","Giá trị TB/đơn",money(avg),"Tự động tính","up")}</div><div class="panel" style="margin-top:18px"><div class="panel-head"><h3>Doanh thu theo ngày</h3><span class="muted">Dữ liệu demo 7 ngày</span></div>${chart()}</div>`;
}
function reportsPage(){
  const top=[...foods].sort((a,b)=>b.sold-a.sold)[0];
  content.innerHTML=`<div class="report-cards"><div class="report-card"><h3>📊 Báo cáo doanh thu</h3><p class="muted">Tổng doanh thu và giá trị trung bình đơn.</p><div class="num">${money(getRevenue())}</div></div><div class="report-card"><h3>💸 Báo cáo chi tiêu</h3><p class="muted">Tổng các khoản chi đã nhập.</p><div class="num">${money(getExpense())}</div></div><div class="report-card"><h3>🏆 Món bán chạy</h3><p class="muted">Xếp hạng theo số lượng bán.</p><div class="num">${top?esc(top.name):"Chưa có"}</div></div></div>`;
}
function settingsPage(){
  content.innerHTML=`<div class="panel"><h3>Thiết lập quán ăn</h3><div class="setting"><div><strong>Tên quán</strong><small id="restaurantName">Quán ăn Cô Nga</small></div><button class="btn" data-action="rename">Chỉnh sửa</button></div><div class="setting"><div><strong>Địa chỉ</strong><small>Đà Nẵng, Việt Nam</small></div><button class="btn" data-action="address">Chỉnh sửa</button></div><div class="setting"><div><strong>Thông báo đơn hàng</strong><small>Nhận thông báo khi có đơn mới</small></div><div class="switch" id="notificationSwitch"></div></div><div class="setting"><div><strong>Xóa dữ liệu demo</strong><small>Đưa dữ liệu về trạng thái ban đầu</small></div><button class="btn danger-btn" data-action="reset">Khôi phục</button></div></div>`;
}

function go(page){
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  document.getElementById("pageTitle").textContent=pages[page].title;
  document.getElementById("pageSubtitle").textContent=pages[page].sub;
  ({dashboard,orders:ordersPage,tables:tablesPage,foods:foodsPage,customers:customersPage,expenses:expensesPage,revenue:revenuePage,reports:reportsPage,settings:settingsPage}[page])();
}

function openModal(tableId=null){document.getElementById("orderModal").classList.add("show");if(tableId)document.getElementById("orderTable").value=String(tableId);setTimeout(()=>document.getElementById("orderFood")?.focus(),50)}
function closeModal(){document.getElementById("orderModal").classList.remove("show")}
function formatDate(date){return new Date(date+"T00:00:00").toLocaleDateString("vi-VN")}
function debounce(fn,delay){let t;return (...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),delay)}}

// Điều hướng sidebar
 document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));

// Event delegation: toàn bộ nút sinh động sau khi render vẫn hoạt động.
content.addEventListener("click", e=>{
  const goBtn=e.target.closest("[data-go]"); if(goBtn){go(goBtn.dataset.go);return;}
  const tableBtn=e.target.closest("[data-table-go]"); if(tableBtn){openModal(Number(tableBtn.dataset.tableGo));return;}
  if(e.target.closest('[data-action="open-order"]')){openModal();return;}
  if(e.target.closest('[data-action="add-food"]')){addFood();return;}
  if(e.target.closest('[data-action="add-expense"]')){addExpense();return;}
  if(e.target.closest('[data-action="add-customer"]')){toast("Khách hàng sẽ được lưu cùng đơn hàng trong bản demo.","info");return;}
  if(e.target.closest('[data-action="rename"]')){renameRestaurant();return;}
  if(e.target.closest('[data-action="address"]')){toast("Chức năng chỉnh địa chỉ có thể nối vào database sau.","info");return;}
  if(e.target.closest('[data-action="reset"]')){resetData();return;}
  if(e.target.closest('[data-action="clear-table"]')){clearTable(Number(e.target.closest('[data-action="clear-table"]').dataset.tableId));return;}

  const delOrder=e.target.closest("[data-delete-order]"); if(delOrder){deleteOrder(delOrder.dataset.deleteOrder);return;}
  const status=e.target.closest("[data-id].status-btn"); if(status){cycleStatus(status.dataset.id);return;}
  const delFood=e.target.closest("[data-delete-food]"); if(delFood){deleteFood(delFood.dataset.deleteFood);return;}
  const editFood=e.target.closest("[data-edit-food]"); if(editFood){editFoodItem(editFood.dataset.editFood);return;}
  const delExpense=e.target.closest("[data-delete-expense]"); if(delExpense){deleteExpense(Number(delExpense.dataset.deleteExpense));return;}
});

function nextOrderId(){
  const nums=orders.map(o=>Number(String(o.id).replace("#",""))).filter(Number.isFinite);
  return "#"+(Math.max(1025,...nums)+1);
}

function saveOrder(){
  const table=Number(document.getElementById("orderTable").value);
  const food=document.getElementById("orderFood").value;
  const qty=Math.max(1,Number(document.getElementById("orderQty").value)||1);
  const customer=document.getElementById("orderCustomer").value.trim()||"Khách lẻ";
  const f=foods.find(x=>x.name===food);
  if(!f){toast("Không tìm thấy món ăn.","error");return;}
  if(getTableStatus(table)==="Có khách"){toast(`Bàn ${table} đang có khách. Có thể thêm món vào bàn này.`,"info");}
  orders.unshift({id:nextOrderId(),table,customer,food,qty,total:f.price*qty,status:"Chờ xử lý",createdAt:todayISO()});
  f.sold+=qty;
  save(STORAGE.orders,orders);save(STORAGE.foods,foods);
  document.getElementById("orderQty").value=1;document.getElementById("orderCustomer").value="";closeModal();
  toast("Tạo đơn hàng thành công");go("orders");
}

document.getElementById("closeModal").addEventListener("click",closeModal);
document.getElementById("saveOrder").addEventListener("click",saveOrder);
document.getElementById("orderModal").addEventListener("click",e=>{if(e.target.id==="orderModal")closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});

document.querySelector(".icon-btn")?.addEventListener("click",()=>toast(`Bạn có ${orders.filter(o=>o.status==="Chờ xử lý").length} đơn đang chờ xử lý.`,"info"));

function cycleStatus(id){
  const states=["Chờ xử lý","Đang làm","Hoàn thành"];
  const o=orders.find(x=>x.id===id); if(!o)return;
  o.status=states[(states.indexOf(o.status)+1)%states.length];
  save(STORAGE.orders,orders);toast(`${id}: ${o.status}`);go("orders");
}
function clearTable(tableId){
  const openOrders=orders.filter(o=>Number(o.table)===tableId && o.status!=="Hoàn thành" && o.status!=="Đã hủy");
  if(!openOrders.length){toast(`Bàn ${tableId} đang trống.`,"info");return;}
  if(!confirm(`Xác nhận thanh toán và dọn Bàn ${tableId}?`))return;
  openOrders.forEach(o=>o.status="Hoàn thành");
  save(STORAGE.orders,orders);toast(`Bàn ${tableId} đã thanh toán và sẵn sàng đón khách.`);go("tables");
}
function deleteOrder(id){
  if(!confirm(`Xóa đơn ${id}?`))return;
  orders=orders.filter(o=>o.id!==id);save(STORAGE.orders,orders);toast("Đã xóa đơn hàng","info");go("orders");
}
function addFood(){
  const name=prompt("Tên món:"); if(!name?.trim())return;
  const price=Number(prompt("Giá bán (VNĐ):","25000")); if(!price||price<0){toast("Giá không hợp lệ","error");return;}
  const category=prompt("Nhóm món:","Món chính")||"Khác";
  const icon=prompt("Emoji đại diện:","🍜")||"🍽️";
  foods.push({id:"M"+Date.now(),name:name.trim(),category,price,sold:0,icon});save(STORAGE.foods,foods);toast("Đã thêm món ăn");go("foods");
}
function editFoodItem(id){
  const f=foods.find(x=>x.id===id);if(!f)return;
  const name=prompt("Tên món:",f.name);if(!name?.trim())return;
  const price=Number(prompt("Giá bán:",String(f.price)));if(!price||price<0)return;
  f.name=name.trim();f.price=price;save(STORAGE.foods,foods);toast("Đã cập nhật món");go("foods");
}
function deleteFood(id){if(!confirm("Xóa món này khỏi thực đơn?"))return;foods=foods.filter(f=>f.id!==id);save(STORAGE.foods,foods);toast("Đã xóa món","info");go("foods")}
function addExpense(){
  const name=prompt("Nội dung chi:");if(!name?.trim())return;
  const amount=Number(prompt("Số tiền (VNĐ):","100000"));if(!amount||amount<0){toast("Số tiền không hợp lệ","error");return}
  const category=prompt("Nhóm chi:","Nguyên liệu")||"Khác";
  expenses.unshift({id:Date.now(),name:name.trim(),category,amount,date:todayISO()});save(STORAGE.expenses,expenses);toast("Đã thêm khoản chi");go("expenses");
}
function deleteExpense(id){if(!confirm("Xóa khoản chi này?"))return;expenses=expenses.filter(e=>e.id!==id);save(STORAGE.expenses,expenses);toast("Đã xóa khoản chi","info");go("expenses")}
function renameRestaurant(){const n=prompt("Tên quán:",localStorage.getItem("qa_name")||"Quán ăn Cô Nga");if(!n?.trim())return;localStorage.setItem("qa_name",n.trim());document.getElementById("restaurantName").textContent=n.trim();toast("Đã cập nhật tên quán")}
function resetData(){if(!confirm("Khôi phục toàn bộ dữ liệu demo?"))return;foods=structuredClone(seedFoods);orders=structuredClone(seedOrders);expenses=structuredClone(seedExpenses);tables=structuredClone(seedTables);save(STORAGE.foods,foods);save(STORAGE.orders,orders);save(STORAGE.expenses,expenses);save(STORAGE.tables,tables);toast("Đã khôi phục dữ liệu");go("dashboard")}

// Khởi chạy
const savedName=localStorage.getItem("qa_name");
if(savedName) document.querySelector(".brand strong").textContent=savedName.toUpperCase();
dashboard();
