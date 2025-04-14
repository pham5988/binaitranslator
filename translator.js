// ==UserScript==
// @name        bin AI translator
// @namespace   binnguyen
// @version     1.0
// @connect     generativelanguage.googleapis.com
// @match        *://*/*
// @run-at       document-end
// @author      Bin
// @description Dich van ban bang AI gemini
// @grant       GM_log
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(function () {
    "use strict";
  
    const apiKey = "AIzaSyCNwoGaDTz4xLLUS2e6_pO4mjTNCF2dJoA"; // 🔑 Nhập API key Gemini tại đây
    const model = "gemini-2.0-flash-lite";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
    // ==== CSS popup ====
    GM_addStyle(`
    /* Nut dich */
    .tm-translate-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #6e8efb, #a777e3);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
        transition: all 0.2s ease;
        margin: 5px;
        outline: none;
    }
  
    .tm-translate-button:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transform: translateY(-1px);
    }
  
    .tm-translate-button:active {
        transform: translateY(1px);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }
  
    /* Container của popup */
    .tm-popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 900px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        z-index: 9999;
        overflow: hidden;
        opacity: 0;
        animation: fadeIn 0.3s ease forwards;
    }
  
    @keyframes fadeIn {
        to { opacity: 1; }
    }
  
    /* Phần header của popup */
    .tm-popup-header {
        background: linear-gradient(135deg, #6e8efb, #a777e3);
        color: white;
        padding: 12px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        user-select: none;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
    }
  
    .tm-popup-title {
        font-weight: 500;
        font-size: 16px;
    }
  
    /* Nút đóng */
    .tm-popup-close {
        cursor: pointer;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.2);
        transition: all 0.2s ease;
    }
  
    .tm-popup-close:hover {
        background-color: rgba(255, 255, 255, 0.4);
        transform: scale(1.1);
    }
  
    .tm-popup-close:before, .tm-popup-close:after {
        content: '';
        position: absolute;
        width: 12px;
        height: 2px;
        background-color: white;
    }
  
    .tm-popup-close:before {
        transform: rotate(45deg);
    }
  
    .tm-popup-close:after {
        transform: rotate(-45deg);
    }
  
    /* Phần nội dung */
    .tm-popup-content {
        padding: 20px;
        max-height: 400px;
        overflow-y: auto;
        line-height: 1.6;
        color: #333;
    }
  
    /* Scrollbar cho phần nội dung */
    .tm-popup-content::-webkit-scrollbar {
        width: 6px;
    }
  
    .tm-popup-content::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }
  
    .tm-popup-content::-webkit-scrollbar-thumb {
        background: #c5c5c5;
        border-radius: 3px;
    }
  
    .tm-popup-content::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
  `);
  
    // ==== Ẩn popup khi click ngoài ====
    document.addEventListener("mousedown", (e) => {
      const btnTranslate = document.querySelector(".tm-translate-button");
      const resultPopup = document.querySelector(".tm-popup");
  
      // Nếu click vào nút dịch thì không ẩn popup
      if (btnTranslate && e.target.closest(".tm-translate-button")) return;
  
      // Nếu click vào popup kết quả thì không ẩn popup
      if (
        (!btnTranslate || !btnTranslate.contains(e.target)) &&
        (!resultPopup || !resultPopup.contains(e.target))
      ) {
        removePopup(".tm-translate-button");
      }
    });
  
    // ==== Bắt sự kiện bôi đen ====
    document.addEventListener("mouseup", () => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
  
        const selectedText = selection.toString().trim();
        if (!selectedText) return;
  
        try {
          const range = selection.getRangeAt(0);  // Lấy đoạn văn bản được chọn
          const rect = range.getBoundingClientRect(); // Lấy vị trí của đoạn văn bản được chọn
          showTranslateButtonPopup(selectedText, rect);
        } catch (err) {
          console.warn("Err:", err);
        }
      }, 30);
    });
  
    // ==== Hiện nút Dịch ====
    function showTranslateButtonPopup(text, rect) {
      removePopup(".tm-translate-button");
  
      const translateBtn = document.createElement("button");
      translateBtn.className = "tm-translate-button";
      translateBtn.innerText = "Dịch";
  
      // Thêm sự kiện click cho nút dịch
      translateBtn.onclick = (e) => {
        e.stopPropagation();
        removePopup(".tm-translate-button");
        window.getSelection().removeAllRanges();
        showResultPopup(text, rect);
      };
  
      // Thiết lập vị trí
      translateBtn.style.position = "absolute";
      translateBtn.style.zIndex = "9997";
      translateBtn.style.top = `${rect.bottom + window.scrollY + 10}px`;
      translateBtn.style.left = `${rect.left + window.scrollX}px`;
      // Thêm vào body
      document.body.appendChild(translateBtn);
    }
  
    // ==== Hiện popup kết quả dịch ====
    function showResultPopup(text, rect) {
      // Xoá popup cũ nếu có
      removePopup(".tm-popup");
  
      // Tạo popup
      const popup = document.createElement("div");
      popup.className = "tm-popup";
  
      // Tạo header
      const header = document.createElement('div');
      header.className = 'tm-popup-header';
  
      // Tiêu đề - Sửa lỗi: định nghĩa title
      const title = "Bin AI Translator";
      const titleElement = document.createElement('div');
      titleElement.className = 'tm-popup-title';
      titleElement.textContent = title;
  
      // Nút đóng
      const closeBtn = document.createElement("div");
      closeBtn.className = "tm-popup-close";
      closeBtn.onclick = () => popup.remove();
  
      // Phần nội dung
      const resultDiv = document.createElement("div");
      resultDiv.className = "tm-popup-content";
      resultDiv.innerText = "Đang dịch...";
  
      // Lắp ráp các phần
      header.appendChild(titleElement);
      header.appendChild(closeBtn);
      popup.appendChild(header);
      popup.appendChild(resultDiv);
  
      // Vị trí popup dựa trên rect
      popup.style.position = "absolute"; // Đảm bảo vị trí tuyệt đối
      popup.style.top = `${rect.bottom + window.scrollY + 10}px`;
      popup.style.left = `${rect.left + window.scrollX}px`;
      popup.style.transform = "none"; // Xóa transform mặc định (nếu có)
  
      // Thêm vào DOM
      //overlay.appendChild(popup);
      document.body.appendChild(popup);
  
      // Chức năng kéo thả
      makeDraggable(popup, header);
  
      // Gọi API Gemini để dịch văn bản
      callGeminiAPI(text, resultDiv);
    }
  
    // ==== Tạo chức năng gọi API Gemini ====
    function callGeminiAPI(text, resultDiv) {
      // Gọi API Gemini để dịch văn bản
      GM_xmlhttpRequest({
        method: "POST",
        url: url,
        headers: {
          "Content-Type": "application/json"
        },
        data: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Bạn là phiên dịch viên, nhiệm vụ của bạn là dịch đoạn sau sang tiếng Việt, ngắn gọn chính xác nhất có thể:\n${text}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7
          }
        }),
        onload: function (res) {
          try {
            const data = JSON.parse(res.responseText);
            const result =
              data?.candidates?.[0]?.content?.parts?.[0]?.text ||
              "Không có kết quả.";
            resultDiv.innerText = result;
            console.log("✅ Dịch thành công:", result);
          } catch (err) {
            console.error("❌ Lỗi xử lý kết quả:", err);
            resultDiv.innerText = "Lỗi xử lý kết quả.";
          }
        },
        onerror: function (err) {
          console.error("❌ Lỗi gọi API:", err);
          resultDiv.innerText = "Lỗi khi dịch.";
        }
      });
    }
  
    // === Chức năng kéo thả ===
    function makeDraggable(element, handle) {
      let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
      handle.onmousedown = dragMouseDown;
  
      function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Lấy vị trí chuột ban đầu
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Kích hoạt sự kiện di chuyển khi chuột di chuyển
        document.onmousemove = elementDrag;
      }
  
      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // Tính toán vị trí mới
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
  
        // Reset transform để di chuyển bằng top và left
        element.style.transform = 'none';
  
        // Đặt vị trí mới của phần tử
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
      }
  
      function closeDragElement() {
        // Dừng di chuyển khi nhả chuột
        document.onmouseup = null;
        document.onmousemove = null;
      }
    }
  
    // ==== Xoá popup ====
    function removePopup(selector) {
      const existing = document.querySelector(selector);
      if (existing) existing.remove();
    }
  })();
  