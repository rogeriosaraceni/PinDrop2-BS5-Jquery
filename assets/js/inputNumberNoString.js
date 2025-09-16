document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('keydown', (event) => {
        if (event.key === 'e' || event.key === 'E' || event.key === '+' || event.key === '-' || event.key === '.' || event.key === ',') {
            event.preventDefault()
        }
    });

    input.addEventListener('paste', (event) => {
        const pasteContent = (event.clipboardData || window.clipboardData).getData('text')
        if (!/^\d+$/.test(pasteContent)) {
            event.preventDefault()
        }
    });
});