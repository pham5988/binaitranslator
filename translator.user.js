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
// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==

(function () {
    "use strict";

    let apiKey = ""; // 🔑 Nhập API key Gemini tại đây
    let url = ""; // Đường dẫn API Gemini
    const model = "gemini-2.0-flash-lite"; // Mô hình Gemini sử dụng

    // Lấy API Key từ localStorage nếu có
    function initApiKey() {
        apiKey = getApiKey();
        console.log("✅ API Key đã được init:", apiKey);
        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    }
    initApiKey();

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

    /* A-V translate form */
    .tm-translate-form {
        position: relative;
        width: 600px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        z-index: 9999;
        overflow: hidden;
    }

    /* Popup settings form */
    .tm-settings-form {
        position: relative;
        width: 400px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        z-index: 9999;
        overflow: hidden;
    }

    /* Form header */
    .tm-settings-header {
        background: linear-gradient(135deg, #6e8efb, #a777e3);
        color: white;
        padding: 12px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        user-select: none;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
    }

    .tm-settings-title {
        font-weight: 500;
        font-size: 16px;
    }

    /* Close button */
    .tm-settings-close {
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

    .tm-settings-close:hover {
        background-color: rgba(255, 255, 255, 0.4);
        transform: scale(1.1);
    }

    .tm-settings-close:before, .tm-settings-close:after {
        content: '';
        position: absolute;
        width: 12px;
        height: 2px;
        background-color: white;
    }

    .tm-settings-close:before {
        transform: rotate(45deg);
    }

    .tm-settings-close:after {
        transform: rotate(-45deg);
    }

    /* Form content */
    .tm-settings-content {
        padding: 20px;
    }

    /* Form group */
    .tm-form-group {
        margin-bottom: 20px;
    }

    .tm-form-label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #333;
    }

    .tm-form-input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        transition: border-color 0.2s ease;
        box-sizing: border-box;
    }

    .tm-form-input:focus {
        border-color: #6e8efb;
        outline: none;
        box-shadow: 0 0 0 2px rgba(110, 142, 251, 0.2);
    }

    /* Form footer with buttons */
    .tm-settings-footer {
        display: flex;
        justify-content: flex-end;
        padding: 15px 20px;
        background-color: #f9f9f9;
        border-top: 1px solid #eee;
        gap: 10px;
    }

    /* Button styles */
    .tm-button {
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 500;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
    }

    .tm-button-primary {
        background: linear-gradient(135deg, #6e8efb, #a777e3);
        color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .tm-button-primary:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        transform: translateY(-1px);
    }

    .tm-button-primary:active {
        transform: translateY(1px);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .tm-button-secondary {
        background-color: #f1f1f1;
        color: #333;
    }

    .tm-button-secondary:hover {
        background-color: #e5e5e5;
    }

    /* Keyboard shortcut info */
    .tm-shortcut-info {
        display: block;
        margin-top: 5px;
        font-size: 12px;
        color: #777;
        font-style: italic;
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
      let promt = `Bạn là phiên dịch viên, nhiệm vụ của bạn là dịch đoạn sau sang tiếng Việt, ngắn gọn chính xác nhất:`
      callGeminiAPI(text, resultDiv, promt);
  }

    // ==== Tạo chức năng gọi API Gemini ====
    function callGeminiAPI(text, resultDiv, promt) {
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
                  text: `${promt}\n${text}`
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

    // ==== Tạo form ====
    function createForm(config){
      const overlay = document.createElement('div');
      overlay.className = config.overlayClass || '';

      const form = document.createElement('div');
      form.className = config.formClass || 'tm-settings-form';

      // Tạo header
      if (config.header){
      const header = document.createElement('div');
      header.className = 'tm-settings-header';
      header.textContent = config.header.title || 'Form Title';
      form.appendChild(header);
      
      // Tạo nút đóng trên header
      const closeBtn = document.createElement('div');
      closeBtn.className = 'tm-settings-close';
      closeBtn.onclick = function() {
          document.body.removeChild(overlay);
      };
      header.appendChild(closeBtn);
      }

      //Tạo nội dung form
      const content = document.createElement('div');
      content.className = config.contentClass || 'tm-settings-content';
      form.appendChild(content);

      config.formGroups?.forEach(group => {
        const formGroup = document.createElement('div');
        formGroup.className = 'tm-form-group';

      //Tạo label
      if (group.label){
          const label = document.createElement('label');
          label.className = group.label.className || 'tm-form-label';
          label.textContent = group.label.text; 
          label.htmlFor = group.label.inputId || 'input-id';
          formGroup.appendChild(label);
      }

      // Tạo input
      if (group.input){
          const input = document.createElement('input');
          input.className = group.input.className || 'tm-form-input';
          input.id = group.input.inputId || 'input-id';
          input.type = group.input.type || 'text';
          input.placeholder = group.input.placeholder || 'Nhập văn bản tại đây';
          formGroup.appendChild(input);
      }

        // Tạo textarea
      if (group.textarea){
          const textarea = document.createElement('textarea');
          textarea.className = group.textarea.className || 'tm-form-input';
          textarea.id = group.textarea.inputId || 'textarea-id';
          textarea.placeholder = group.textarea.placeholder || 'Nhập văn bản tại đây';
          textarea.style.height = group.textarea.height || '150px'; // Chiều cao mặc định
          formGroup.appendChild(textarea);
      }
      content.appendChild(formGroup);
    });

      // Vi trí form
      form.style.position = 'fixed';
      form.style.top = '50%';
      form.style.left = '50%';
      form.style.transform = 'none';

      // Tạo footer
      if (config.footer){
        const footer = document.createElement('div');
        footer.className = 'tm-settings-footer';

        config.footer.buttons.forEach((button) => {
          const btn = document.createElement('button');
          btn.className = button.className || 'tm-button';
          btn.textContent = button.text || 'Button';

          // Check if it's a cancel button (secondary)
          if (button.className && button.className.includes('tm-button-secondary')) {
            // Assign onclick to remove the overlay containing the form
            btn.onclick = () => {
              if (overlay && document.body.contains(overlay)) {
                document.body.removeChild(overlay);
              }
            };
          } else {
            // Assign the provided onclick or a default for other buttons
            btn.onclick = button.onclick || function() { console.log('Button clicked!'); };
          }

          footer.appendChild(btn);
        });
        form.appendChild(footer);
      }

      overlay.appendChild(form);
      document.body.appendChild(overlay);

      makeDraggable(form, header);
    }

    // ==== Setting popup ====
    function showSettingsPopup() {
      removePopup(".tm-settings-form");

      // Tạo overlay
      const overlay = document.createElement('div');
      overlay.className = 'tm-settings-overlay';

      // Tạo form container
      const form = document.createElement('div');
      form.className = 'tm-settings-form';

      // Đặt vị trí cho form
      form.style.position = 'fixed';
      form.style.top = '50%';
      form.style.left = '50%';
      form.style.transform = 'translate(-50%, -50%)';

      // Tạo header
      const header = document.createElement('div');
      header.className = 'tm-settings-header';

      // Tiêu đề
      const title = document.createElement('div');
      title.className = 'tm-settings-title';
      title.textContent = 'Cài đặt API Key';

      // Nút đóng
      const closeBtn = document.createElement('div');
      closeBtn.className = 'tm-settings-close';
      closeBtn.onclick = function() {
          document.body.removeChild(overlay);
      };

      // Phần nội dung form
      const content = document.createElement('div');
      content.className = 'tm-settings-content';

      // Form group cho API Key
      const formGroup = document.createElement('div');
      formGroup.className = 'tm-form-group';

      // Label
      const label = document.createElement('label');
      label.className = 'tm-form-label';
      label.textContent = 'API Key';
      label.htmlFor = 'api-key-input';

      // Input
      const input = document.createElement('input');
      input.className = 'tm-form-input';
      input.id = 'api-key-input';
      input.type = 'text';
      input.placeholder = 'Nhập API Key của bạn tại đây';
      input.value = getApiKey();

      // Shortcut info
      const shortcutInfo = document.createElement('span');
      shortcutInfo.className = 'tm-shortcut-info';
      shortcutInfo.textContent = 'Phím tắt: Alt+S để mở form này';

      // Form footer
      const footer = document.createElement('div');
      footer.className = 'tm-settings-footer';

      // Nút Save
      const saveBtn = document.createElement('button');
      saveBtn.className = 'tm-button tm-button-primary';
      saveBtn.textContent = 'Lưu';
      saveBtn.onclick = function() {
          saveApiKey(input.value);
          document.body.removeChild(overlay);
          // Thông báo lưu thành công
          //showNotification('API Key đã được lưu thành công!');
      };

      // Nút Cancel
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'tm-button tm-button-secondary';
      cancelBtn.textContent = 'Hủy';
      cancelBtn.onclick = function() {
          document.body.removeChild(overlay);
      };

      // Lắp ráp form
      formGroup.appendChild(label);
      formGroup.appendChild(input);
      formGroup.appendChild(shortcutInfo);

      content.appendChild(formGroup);

      header.appendChild(title);
      header.appendChild(closeBtn);

      footer.appendChild(cancelBtn);
      footer.appendChild(saveBtn);

      form.appendChild(header);
      form.appendChild(content);
      form.appendChild(footer);

      overlay.appendChild(form);
      document.body.appendChild(overlay);

      // Focus vào input
      setTimeout(() => {
          input.focus();
      }, 100);

      // Xử lý phím Enter để lưu
      input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
              saveApiKey(input.value);
              document.body.removeChild(overlay);
              //showNotification('API Key đã được lưu thành công!');
          }
      });

      // Xử lý click bên ngoài để đóng form
      overlay.addEventListener('click', function(e) {
          if (e.target === overlay) {
              document.body.removeChild(overlay);
          }
      });
    }

    // Lưu API Key vào localStorage
    function saveApiKey(inputApiKey) {
        GM_setValue('apiKey', inputApiKey);
        console.log("✅ API Key đã được lưu:", inputApiKey);
        initApiKey(); // Cập nhật lại API Key
        console.log("✅ API Key đang sử dụng:", apiKey);
    }

    // Lấy API Key từ localStorage
    function getApiKey() {
        return GM_getValue('apiKey', '');
    }

    // ==== Hiện form dich Viet Anh ====
    function showTranslateForm() {
    removePopup(".tm-translate-form");
    // // Tạo overlay
    // const overlay = document.createElement("div");
    // overlay.className = "tm-translate-overlay";

    // // tao form container
    // const form = document.createElement("div");
    // form.className = "tm-translate-form";

    // // dat vi tri cho form
    // form.style.position = "fixed";
    // form.style.top = "50%";
    // form.style.left = "50%";
    // //form.style.transform = "none"; // Xóa transform mặc định (nếu có)
    // //form.style.transform = "translate(-50%, -50%)";

    // // tao header
    // const header = document.createElement("div");
    // header.className = "tm-settings-header";

    // // Tieu de
    // const title = document.createElement("div");
    // title.className = "tm-settings-title";
    // title.textContent = "Dịch văn bản";

    // // nut dong
    // const closeBtn = document.createElement("div");
    // closeBtn.className = "tm-settings-close";
    // closeBtn.onclick = function() {
    //     document.body.removeChild(overlay);
    // };

    // // phan noi dung form
    // const content = document.createElement("div");
    // content.className = "tm-settings-content";

    // // Form group
    // const formGroup = document.createElement("div");
    // formGroup.className = "tm-form-group";

    // // Label
    // const label = document.createElement("label");
    // label.className = "tm-form-label";
    // label.textContent = "Văn bản cần dịch";
    // label.htmlFor = "translate-input";

    // //Result Lable
    // const resultLabel = document.createElement("label");
    // resultLabel.className = "tm-form-label";
    // resultLabel.textContent = "Result:";
    // resultLabel.htmlFor = "translate-result";

    // // Input
    // const input = document.createElement("textarea");
    // input.className = "tm-form-input";
    // input.id = "translate-input";
    // input.placeholder = "Nhập văn bản cần dịch tại đây";
    // input.style.height = "150px"; // Chiều cao mặc định


    // // Shortcut info
    // const shortcutInfo = document.createElement("span");
    // shortcutInfo.className = "tm-shortcut-info";
    // shortcutInfo.textContent = "Phím tắt: Alt+Z để mở form này";

    // // Form footer
    // const footer = document.createElement("div");
    // footer.className = "tm-settings-footer";

    // // Nút Dịch
    // const translateBtn = document.createElement("button");
    // translateBtn.className = "tm-button tm-button-primary";
    // translateBtn.textContent = "Dịch";
    // translateBtn.onclick = function() {
    //     const textToTranslate = input.value;
    //     if (textToTranslate.trim() === "") {
    //         alert("Vui lòng nhập văn bản cần dịch.");
    //         return;
    //     }
    //     let promt = "Dịch đoạn văn bản sau sang tiếng Anh, chỉ hiển thị kết quả dịch:"
    //     callGeminiAPI(textToTranslate, resultLabel, promt);
    // }
    // // Nút Hủy
    // const cancelBtn = document.createElement("button");
    // cancelBtn.className = "tm-button tm-button-secondary";
    // cancelBtn.textContent = "Hủy";
    // cancelBtn.onclick = function() {
    //     document.body.removeChild(overlay);
    // };

    // // Lắp ráp form
    // formGroup.appendChild(label);
    // formGroup.appendChild(input);
    // formGroup.appendChild(shortcutInfo);
    // formGroup.appendChild(resultLabel);

    // content.appendChild(formGroup);

    // header.appendChild(title);
    // header.appendChild(closeBtn);

    // footer.appendChild(cancelBtn);
    // footer.appendChild(translateBtn);

    // form.appendChild(header);
    // form.appendChild(content);
    // form.appendChild(footer);

    // overlay.appendChild(form);
    // document.body.appendChild(overlay);

    // Chức năng kéo thả
    createForm({
      overlayClass: 'tm-translate-overlay',
      formClass: 'tm-translate-form',
      contentClass: 'tm-settings-content',
      header: {
        title: 'Dịch Việt Anh',
      },
      formGroups: [ // ✅ danh sách các group
        {
          label: {
            className: 'tm-form-label',
            text: 'Văn bản cần dịch',
            inputId: 'translate-input'
          },
          input: {
            className: 'tm-form-input',
            inputId: 'translate-input',
            type: 'text',
            placeholder: 'Nhập văn bản cần dịch tại đây'
          }
        },
        {
          label: {
            className: 'tm-form-label',
            text: 'Kết quả dịch',
            inputId: 'translate-result'
          },
          textarea: {
            className: 'tm-form-input',
            inputId: 'translate-result',
            placeholder: 'Kết quả sẽ hiển thị ở đây...',
            height: '100px'
          }
        }
      ],
      footer: {
        buttons: [
          {
            text: 'Cancel',
            className: 'tm-button tm-button-secondary' // onclick is now handled by createForm
          },
          {
            text: 'Translate',
            className: 'tm-button tm-button-primary',
            onclick: function() {
              const textToTranslate = document.getElementById('translate-input').value;
              console.log("Text to translate:", textToTranslate);
              if (textToTranslate.trim() === "") {
                alert("Vui lòng nhập văn bản cần dịch.");
                return;
              }
              const resultTarget = document.getElementById('translate-result');
              let promt = "Dịch đoạn văn bản sau sang tiếng Anh, chỉ hiển thị kết quả dịch:"
              callGeminiAPI(textToTranslate, resultTarget, promt);
            }
          }
        ]
    }});
  }

    // Show settings popup setting khi nhấn Alt + key
    document.addEventListener('keydown', function(e) {
      // Kiểm tra nếu phím Alt được nhấn cùng với phím S
      if (e.altKey && e.key === 's') {
        e.preventDefault(); // Ngăn hành vi mặc định của trình duyệt
        showSettingsPopup();
      }

        // Show translate form when Alt + z is pressed
        if (e.altKey && e.key === 'z') {
        e.preventDefault(); // Ngăn hành vi mặc định của trình duyệt
        showTranslateForm();
      }
    });
  })();
