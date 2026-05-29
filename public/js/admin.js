document.addEventListener("DOMContentLoaded", () => {
  const editorContainer = document.querySelector("#editor-container");
  const contentInput = document.querySelector("#content");
  const form = contentInput ? contentInput.closest("form") : null;

  if (!editorContainer || !contentInput || !form) return;

  function isEmptyHtml(html = "") {
    const cleaned = String(html)
      .replace(/<p><br><\/p>/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, "")
      .trim();

    return cleaned.length === 0;
  }

  if (window.Quill) {
    const quill = new Quill("#editor-container", {
      theme: "snow",
      placeholder: "Write your article content here...",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image", "code-block"],
          ["clean"],
        ],
      },
    });

    if (window.initialEditorContent) {
      quill.root.innerHTML = window.initialEditorContent;
    }

    function updateContentInput() {
      const html = quill.root.innerHTML.trim();
      contentInput.value = isEmptyHtml(html) ? "" : html;
    }

    quill.on("text-change", updateContentInput);

    form.addEventListener("submit", () => {
      updateContentInput();
    });

    updateContentInput();
  } else {
    editorContainer.innerHTML = "";

    const fallbackTextarea = document.createElement("textarea");
    fallbackTextarea.className = "form-input min-h-60";
    fallbackTextarea.placeholder = "Write your article content here...";

    fallbackTextarea.value = window.initialEditorContent || "";
    contentInput.value = fallbackTextarea.value;

    fallbackTextarea.addEventListener("input", () => {
      contentInput.value = fallbackTextarea.value;
    });

    form.addEventListener("submit", () => {
      contentInput.value = fallbackTextarea.value.trim();
    });

    editorContainer.appendChild(fallbackTextarea);
  }
});