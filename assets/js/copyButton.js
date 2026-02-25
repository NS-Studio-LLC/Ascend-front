document.querySelectorAll(".copy-btn").forEach((btn) => {
    let timer;

    btn.addEventListener("click", async (e) => {
        e.preventDefault();

        const pageUrl = window.location.href;

        try {
            await navigator.clipboard.writeText(pageUrl);

            btn.dataset.tooltip = "Copied";
            clearTimeout(timer);
            timer = setTimeout(() => {
                btn.dataset.tooltip = "Copy";
            }, 1200);
        } catch (err) {
            const temp = document.createElement("textarea");
            temp.value = pageUrl;
            temp.setAttribute("readonly", "");
            temp.style.position = "fixed";
            temp.style.top = "-9999px";
            document.body.appendChild(temp);
            temp.select();
            const ok = document.execCommand("copy");
            document.body.removeChild(temp);

            btn.dataset.tooltip = ok ? "Copied" : "Failed";
            clearTimeout(timer);
            timer = setTimeout(() => {
                btn.dataset.tooltip = "Copy";
            }, 1200);
        }
    });
});
