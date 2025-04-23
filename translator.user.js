// ==UserScript==
// @name        Bin AI translator
// @namespace   binnguyen
// @version     2.1
// @connect     generativelanguage.googleapis.com
// @match       *://*/*
// @run-at      document-end
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
        width: 50%;
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
        width: 50%;
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
        width: 40%;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        z-index: 9999;
        overflow: hidden;
    }

    /* Form header */
    .tm-header {
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
    
    .tm-result-box {
      background: #f9f9f9;
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 10px;
      min-height: 80px;
      font-size: 14px;
      white-space: pre-wrap;
      color: #333;
    }
    
    .tm-copy-button {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      font-size: 14px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: color 0.2s ease;
      position: relative;
      margin-top: 5px;
    }

    .tm-copy-button:hover {
      color: #007BFF;
    }

    .tm-copy-button.copied::after {
      content: "✓ Copied";
      position: absolute;
      right: -80px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      color: green;
      opacity: 1;
      transition: opacity 0.3s ease;
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
        const selection = window.getSelection();  // Lấy đoạn văn bản được chọn
        if (!selection || selection.rangeCount === 0) return; // Nếu không có đoạn văn bản nào được chọn

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

      createForm({
        overlayClass: 'tm-popup-overlay',
        formClass: 'tm-popup',
        contentClass: 'tm-popup-content',
        header: {
          title: 'Bin AI Translator',
          //className: 'tm-popup-header',
        },
        formGroups: [
          {
            label: {
              className: 'tm-form-label',
              //text: '',
              inputId: 'translate-result'
            },
            resultBox: {
              //className: 'tm-result-box',
              id: 'translate-result'
            }
          }
        ],
      });

      // Chức năng kéo thả
      const popup = document.querySelector('.tm-popup');
      const header = popup.querySelector('.tm-header');
      // Vị trí popup dựa trên rect
      popup.style.position = "absolute"; // Đảm bảo vị trí tuyệt đối
      popup.style.top = `${rect.bottom + window.scrollY + 10}px`;
      popup.style.left = `${rect.left + window.scrollX}px`;
      popup.style.transform = "none"; // Xóa transform mặc định (nếu có)
      makeDraggable(popup, header);

      // Gọi API Gemini để dịch văn bản
      const resultDiv = document.querySelector("#translate-result");
      let promt = `Bạn là phiên dịch viên, nhiệm vụ của bạn là dịch đoạn sau sang tiếng Việt và chỉ hiện thị kết quả dịch:`
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

        const rect = element.getBoundingClientRect();
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
      header.className = 'tm-header';
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
          input.value = group.input.value || ''; // Giá trị mặc định
          input.focus() // Tự động focus vào input khi mở form
          formGroup.appendChild(input);
      }

        // Tạo textarea
      if (group.textarea){
          const textarea = document.createElement('textarea');
          textarea.className = group.textarea.className || 'tm-form-input';
          textarea.id = group.textarea.inputId || 'textarea-id';
          textarea.placeholder = group.textarea.placeholder || 'Nhập văn bản tại đây';
          textarea.style.height = group.textarea.height || '150px'; // Chiều cao mặc định
          textarea.style.resize = 'vertical'; // Cho phép thay đổi chiều cao
          formGroup.appendChild(textarea);
      }
      // Tạo result box
      if (group.resultBox) {
        const resultDiv = document.createElement('div');
        resultDiv.id = group.resultBox.id || 'translate-result';
        resultDiv.className = group.resultBox.className || 'tm-result-box';
        resultDiv.textContent = ''; // Ban đầu rỗng
        formGroup.appendChild(resultDiv);

         // ✅ Thêm nút Copy
        const copyBtn = document.createElement("button");
        copyBtn.className = "tm-copy-button";
        // add svg icon vào button copy
        copyBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy">
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"
              fill="currentColor"></path>
          </svg>
        `;
        copyBtn.setAttribute("data-target", resultDiv.id);
        formGroup.appendChild(copyBtn); // Gắn bên dưới kết quả (hoặc dùng insertAdjacentElement nếu muốn gắn cạnh)
      }
      content.appendChild(formGroup);
    });

      // Vi trí form
      form.style.position = 'fixed';
      form.style.top = '50%';
      form.style.left = '50%';
      form.style.transform = 'translate(-50%, -50%)';

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

      //makeDraggable(form, header);
    }

    // ==== Setting popup ====
    function showSettingsPopup() {
      removePopup(".tm-settings-form");

      createForm({
        overlayClass: 'tm-settings-overlay',
        formClass: 'tm-settings-form',
        contentClass: 'tm-settings-content',
        header: {
          title: 'Cài đặt API Key',
        },
        formGroups: [
          {
            label: {
              className: 'tm-form-label',
              text: 'API Key',
              inputId: 'api-key-input'
            },
            input: {
              className: 'tm-form-input',
              inputId: 'api-key-input',
              type: 'text',
              placeholder: 'Nhập API Key của bạn tại đây',
              value: getApiKey(),
              forcus: true // Tự động focus vào input khi mở form
            }
          }
        ],
        footer: {
          buttons: [
            {
              text: 'Cancel',
              className: 'tm-button tm-button-secondary'
            },
            {
              text: 'Save',
              className: 'tm-button tm-button-primary',
              onclick: function() {
                const input = document.getElementById('api-key-input');
                saveApiKey(input.value);
                document.body.removeChild(overlay);
                //showNotification('API Key đã được lưu thành công!');
              }
            }
          ]
        }
      });

      //makeDraggable(form, header); // Kéo thả form */

      // Focus vào input
      // setTimeout(() => {
      //   formGroup.querySelector('api-key-input').focus();
      //   //input.focus();
      // }, 100); 

      // Xử lý phím Enter để lưu
      // const input = document.getElementById('api-key-input');
      // input.addEventListener('keydown', function(e) {
      //     if (e.key === 'Enter') {
      //       saveApiKey(input.value);
      //       //document.body.removeChild(overlay);
      //       //showNotification('API Key đã được lưu thành công!');
      //     }
      // });

      // // Xử lý click bên ngoài để đóng form
      // const overlay = document.querySelector('.tm-settings-overlay');
      // overlay.addEventListener('click', function(e) {
      //     if (e.target === overlay) {
      //       document.body.removeChild(overlay);
      //     }
      // });
    };

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
          textarea: {
            className: 'tm-form-input',
            inputId: 'translate-input',
            placeholder: 'Nhập văn bản cần dịch tại đây',
            height: '100px'
          }
        },
        {
          label: {
            className: 'tm-form-label',
            text: 'Kết quả dịch',
            inputId: 'translate-result'
          },
          resultBox: {
            className: 'tm-result-box',
            id: 'translate-result',
            
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
              //resultTarget.textContent = resultTarget
              let promt = "Dịch đoạn văn bản sau sang tiếng Anh, chỉ hiển thị kết quả dịch:"
              callGeminiAPI(textToTranslate, resultTarget, promt);
            }
          }
        ]
    }});

    // khai báo form và header để có thể kéo thả
    const form = document.querySelector('.tm-translate-form');
    const header = form.querySelector('.tm-header');
    // gỡ transform + tính toán vị trí thật của form
    const rect = form.getBoundingClientRect();
    form.style.transform = 'none'; // ❗ Bỏ transform đi để tránh nhảy
    form.style.top = `${rect.top}px`;
    form.style.left = `${rect.left}px`;

    makeDraggable(form, header); // Kéo thả form
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

    // Thêm sự kiện click cho nút copy
    document.addEventListener("click", function (e) {
      const btn = e.target.closest(".tm-copy-button");
      if (!btn) return; // Nếu không phải nút copy thì thoát

      const targetId = btn.dataset.target;  // Lấy id của phần tử cần copy từ thuộc tính data-target
      const targetEl = document.getElementById(targetId); //
      if (!targetEl) return;
    
      const text = targetEl.textContent || targetEl.innerText;
    
      navigator.clipboard.writeText(text).then(() => {
        btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" 
                          xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy">
                          <path fill-rule="evenodd" clip-rule="evenodd" 
                          d="M18.0633 5.67387C18.5196 5.98499 18.6374 6.60712 18.3262 7.06343L10.8262 18.0634C10.6585 18.3095 10.3898 18.4679 10.0934 18.4957C9.79688 18.5235 9.50345 18.4178 9.29289 18.2072L4.79289 13.7072C4.40237 13.3167 4.40237 12.6835 4.79289 12.293C5.18342 11.9025 5.81658 11.9025 6.20711 12.293L9.85368 15.9396L16.6738 5.93676C16.9849 5.48045 17.607 5.36275 18.0633 5.67387Z" 
                          fill="currentColor"></path></svg>`
        setTimeout(() => btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                          xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy">
                                          <path fill-rule="evenodd" clip-rule="evenodd"
                                            d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"
                                            fill="currentColor"></path></svg>`, 2000);
      }).catch((err) => {
        console.error("Copy lỗi:", err);
        alert("Không thể copy nội dung.");
      });
    });
    
  })();
