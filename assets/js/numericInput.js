document.addEventListener("DOMContentLoaded", () => {
    const input = document.querySelector(".numeric");
    if (!input) return;

    const formatNumber = (value) => {
        const digits = value.replace(/\D/g, "").slice(0, 10);

        const part1 = digits.slice(0, 3);
        const part2 = digits.slice(3, 6);
        const part3 = digits.slice(6, 8);
        const part4 = digits.slice(8, 10);

        let result = part1;

        if (part2) result += " - " + part2;
        if (part3) result += " - " + part3;
        if (part4) result += " - " + part4;

        return result;
    };

    input.addEventListener("input", (e) => {
        const caretPos = input.selectionStart;
        const beforeLength = input.value.length;

        input.value = formatNumber(input.value);

        const afterLength = input.value.length;
        const diff = afterLength - beforeLength;

        input.setSelectionRange(caretPos + diff, caretPos + diff);
    });

    input.addEventListener("keydown", (e) => {
        const allowedKeys = [
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "Tab",
            "Home",
            "End",
        ];

        if (allowedKeys.includes(e.key)) return;

        if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) {
            return;
        }

        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    });
});
