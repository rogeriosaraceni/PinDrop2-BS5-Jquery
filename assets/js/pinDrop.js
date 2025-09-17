function pinDrop2(options) {
    const imgContainer = $(options.imgContainerSelector);
    const removeAllButton = $(options.removeAllButtonSelector);
    const itemSelector = options.itemSelector || '[data-item="pin"]';
    const btnShowHideSelector = options.btnShowHideSelector || '.btnPin-show-hide';
    const confirmMessage = options.confirmMessage || 'Tem certeza que quer apagar todos os pins?';

    let itemNameID = null;
    let itemColor = null;
    let itemTitle = null;
    let pinDragging = null;
    let offsetX = 0;
    let offsetY = 0;
    let draggingFromMenu = false; // 🔥 flag para diferenciar origem do drag

    let pinsData = [];
    let contadorPinos = 0;

    /** -------------------------------------------------
    * Cria pins
    ----------------------------------------------------*/
    function createPin(x, y, cor, nameid, title) {
        const id = 'pin-' + (++contadorPinos);

        const pin = $(`<div class="pin" draggable="false" data-bs-toggle="tooltip" data-bs-title="${title}"></div>`)
            .css({
                left: x + 'px',
                top: y + 'px',
                backgroundColor: cor,
            })
            .attr('data-id', id)
            .attr('data-nameid', nameid)
            .attr('data-title', title);

        imgContainer.append(pin);

        // Inicializar Tooltip
        if (window.bootstrap?.Tooltip) {
            new bootstrap.Tooltip(pin[0]);
        }
        
        savePin(pin, id, nameid, title);
    }

    /** -------------------------------------------------
    * Salva Pins com id
    ----------------------------------------------------*/
    function savePin($pin, id) {
        const containerId = imgContainer.attr('data-containerpin');
        if (!pinsData[containerId]) pinsData[containerId] = [];

        const pos = {
            id: id,
            nameid: String($pin.data('nameid')).toLowerCase(),
            title: $pin.data('title'),
            x: parseFloat($pin.css('left')),
            y: parseFloat($pin.css('top')),
            cor: $pin.css('background-color')
        };

        pinsData[containerId].push(pos);
        updateStateClearButton();
        updateCounters();

        console.log(pinsData);
    }

    /** -------------------------------------------------
    * Oculta ou mostra pin conforme item
    ----------------------------------------------------*/
    function setupTogglePins() {
        $(btnShowHideSelector).off('click').on('click', function (e) {
            e.preventDefault();
            
            const pinClicked = $(this);
            const pinType = pinClicked.closest('tr').find(itemSelector).first().data('nameid');
            
            const pinsDoTipo = $(`.pin[data-nameid="${pinType}"]`);
            if (pinsDoTipo.length === 0) {
                console.log('Nenhum pin do tipo', pinType, 'para mostrar/ocultar');
                pinClicked.addClass('no-pins');
                setTimeout(() => pinClicked.removeClass('no-pins'), 1000);
                return;
            }
            
            pinClicked.removeClass('no-pins');
            pinClicked.toggleClass('pin-hide');
            const isNowHidden = pinClicked.hasClass('pin-hide');
            pinClicked.attr('data-bs-title', isNowHidden ? 'Mostrar' : 'Ocultar');
            
            const element = pinClicked[0];
            const existingInstance = bootstrap.Tooltip.getInstance(element);
            if (existingInstance) existingInstance.dispose();
            new bootstrap.Tooltip(element);
            
            pinsDoTipo.toggle(!isNowHidden);

            console.log('Tipo:', pinType, 'Pins:', pinsDoTipo.length, 'Oculto?', isNowHidden);
        });
    }
    
    /** -------------------------------------------------
    * Remove todos os pins do container específico
    ----------------------------------------------------*/
    function setupRemoveAllButton() {
        removeAllButton.off('click').on('click', function(e) {
            e.stopImmediatePropagation();
            
            if (confirm(confirmMessage)) {
                const pinsToRemove = imgContainer.find('.pin');
                
                pinsToRemove.each(function() {
                    const tooltipInstance = bootstrap.Tooltip.getInstance(this);
                    if (tooltipInstance) tooltipInstance.dispose();
                });
                
                pinsToRemove.each(function() {
                    const id = $(this).data('id');
                    pinsData = pinsData.filter(p => p.id !== id);
                });
                
                pinsToRemove.remove();
                
                updateStateClearButton();
                updateCounters();
            }
            
            return false;
        });
    }

    /** -------------------------------------------------
    * Remove pin com duplo click
    ----------------------------------------------------*/
    function removePinDobleClick($pin) {
        const tooltipInstance = bootstrap.Tooltip.getInstance($pin[0]);
        if (tooltipInstance) tooltipInstance.dispose();
        
        const id = $pin.data('id');
        pinsData = pinsData.filter(p => p.id !== id);
        
        $pin.remove();
        updateStateClearButton();
        updateCounters();
    }

    /** -------------------------------------------------
    * Atualiza botão remover todos
    ----------------------------------------------------*/
    function updateStateClearButton() {
        const totalPins = imgContainer.find('.pin').length;
        removeAllButton.attr('disabled', totalPins === 0);
    }

    /** -------------------------------------------------
    * Atualiza posição do pin
    ----------------------------------------------------*/
    function updatePinPosition($pin) {
        const id = $pin.data('id');
        const idx = pinsData.findIndex(p => p.id === id);
        if (idx !== -1) {
            pinsData[idx].x = parseFloat($pin.css('left'));
            pinsData[idx].y = parseFloat($pin.css('top'));
        }
    }

    /** -------------------------------------------------
    * Atualiza contagem
    ----------------------------------------------------*/
    function updateCounters() {
        $('[data-selected]').val(0);

        const count = {};
        $.each(pinsData, function(_, pin) {
            const nameID = pin.nameid;
            count[nameID] = (count[nameID] || 0) + 1;
        });

        $.each(count, function(nameid, total) {
            $(`[data-selected="${nameid}"]`).val(total);
        });
    }

    /** -------------------------------------------------
    * Eventos
    ----------------------------------------------------*/
    // Arrastar item do menu
    $(itemSelector).on('dragstart', function () {
        itemColor = $(this).css("background-color");
        itemNameID = $(this).data("nameid");
        itemTitle = $(this).data("title");
        draggingFromMenu = true; // 🔥 ativar flag
    });

    // Permitir soltar no container
    imgContainer.on('dragover', function(e) {
        e.preventDefault();
    });

    // Soltar item do menu dentro do container -> cria novo pin
    imgContainer.on('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!draggingFromMenu) return; // 🔥 só cria se veio do menu

        const rect = this.getBoundingClientRect();
        const x = e.originalEvent.clientX - rect.left - 7;
        const y = e.originalEvent.clientY - rect.top - 7;

        createPin(x, y, itemColor, itemNameID, itemTitle);

        itemColor = null;
        itemNameID = null;
        itemTitle = null;
        draggingFromMenu = false; // 🔥 reset
    });

    // Clicar e segurar em um pin existente
    $(document).on('mousedown', '.pin', function (e) {
        e.preventDefault();
        pinDragging = $(this);

        itemColor = null;
        itemNameID = null;
        itemTitle = null;
        
        const rect = this.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        pinDragging.css("cursor", "grabbing");
    });

    // Arrastar pin existente
    imgContainer.on('mousemove', function(e) {
        if (!pinDragging || !pinDragging.closest(imgContainer).length) return;

        const rectMapa = imgContainer[0].getBoundingClientRect();
        let x = e.clientX - rectMapa.left - offsetX;
        let y = e.clientY - rectMapa.top - offsetY;

        x = Math.max(0, Math.min(x, imgContainer.width() - 14));
        y = Math.max(0, Math.min(y, imgContainer.height() - 14));

        pinDragging.css({ left: x + 'px', top: y + 'px' });
    });

    // Soltar pin existente
    imgContainer.on('mouseup', function(e) {
        if (!pinDragging || !pinDragging.closest(imgContainer).length) return;

        updatePinPosition(pinDragging);
        pinDragging.css("cursor", "grab");
        pinDragging = null;
        draggingFromMenu = false;
    });

    // Prevenir arrasto nativo do navegador em pins
    $(document).on('dragstart', '.pin', function(e) {
        e.preventDefault();
    });

    // Duplo clique para remover pin
    $(document).on('dblclick', '.pin', function() {
        removePinDobleClick($(this));
    });

    /** -------------------------------------------------
    * Inicialização
    ----------------------------------------------------*/
    setupRemoveAllButton();
    setupTogglePins();
    updateStateClearButton();
}
