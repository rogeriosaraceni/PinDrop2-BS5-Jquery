function setupTogglePins() {
    $('.btn-show-hide').off('click').on('click', function(e) {
        e.preventDefault();
        
        const pinClicked = $(this);
        const pinType = pinClicked.closest('tr').find('.color-box').first().data('nameid');
        
        // Verificar se existe algum pin deste tipo antes de prosseguir
        const pinsDoTipo = $(`.pin[data-nameid="${pinType}"]`);
        
        if (pinsDoTipo.length === 0) {
            console.log('Nenhum pin do tipo', pinType, 'para mostrar/ocultar');
            
            // Feedback visual de que não há pins
            pinClicked.addClass('no-pins');
            setTimeout(() => pinClicked.removeClass('no-pins'), 1000); // Remove após 1 segundo
            
            return; // Não faz nada se não houver pins
        }
        
        // Remove a classe de feedback se existir
        pinClicked.removeClass('no-pins');
        
        // Toggle na classe do botão e verifica estado
        pinClicked.toggleClass('pin-hide');
        const isNowHidden = pinClicked.hasClass('pin-hide');
        pinClicked.attr('data-bs-title', isNowHidden ? 'Mostrar' : 'Ocultar');
        
        // Atualizar tooltip do Bootstrap
        const element = pinClicked[0];
        const existingInstance = bootstrap.Tooltip.getInstance(element);
        if (existingInstance) existingInstance.dispose();
        new bootstrap.Tooltip(element);
        
        // Esconder/mostrar os pins correspondentes
        pinsDoTipo.toggle(!isNowHidden);
        
        console.log('Tipo:', pinType, 'Pins:', pinsDoTipo.length, 'Oculto?', isNowHidden);
    });
}

function pinDrop(options) {
    const imgContainer = $(options.imgContainerSelector);
    const removeAllButton = $(options.removeAllButtonSelector);
    const confirmMessage = options.confirmMessage || 'Tem certeza que quer apagar todos os pinos do mapa?';

    let itemNameID = null;
    let itemColor = null;
    let itemTitle = null;
    let pinDragging = null;
    let offsetX = 0;
    let offsetY = 0;

    let pinsData = [];
    let contadorPinos = 0;

    /** -------------------------------------------------
    * Atualiza botão remover todos
    ----------------------------------------------------*/
    function updateStateClearButton() {
        removeAllButton.attr('disabled', pinsData.length === 0);
    }

    function savePin($pin, id) {
        const pos = {
            id: id,
            nameid: String($pin.data('nameid')).toLowerCase(),
            title: $pin.data('title'),
            x: parseFloat($pin.css('left')),
            y: parseFloat($pin.css('top'))
        };
        pinsData.push(pos);
        updateStateClearButton();
        updateCounters();

        console.log(pinsData);
    }

    function updatePinPosition($pin) {
        const id = $pin.data('id');
        const idx = pinsData.findIndex(p => p.id === id);
        if (idx !== -1) {
            pinsData[idx].x = parseFloat($pin.css('left'));
            pinsData[idx].y = parseFloat($pin.css('top'));
        }
        updateStateClearButton();
    }

    removeAllButton.on('click', function(e) {
        e.stopImmediatePropagation(); // Impede outros event listeners
        
        if (confirm(confirmMessage)) {
            // Remove apenas os pins deste container específico
            const pinsToRemove = imgContainer.find('.pin');
            
            pinsToRemove.each(function() {
                const tooltipInstance = bootstrap.Tooltip.getInstance(this);
                if (tooltipInstance) tooltipInstance.dispose();
            });
            
            // Remove dos dados
            pinsToRemove.each(function() {
                const id = $(this).data('id');
                pinsData = pinsData.filter(p => p.id !== id);
            });
            
            // Remove visualmente
            pinsToRemove.remove();
            
            updateStateClearButton();
            updateCounters();
        }
        
        return false; // Previne comportamento padrão e bubbling
    });

    function createPin(x, y, cor, nameid, title) {
        const id = 'pin-' + (++contadorPinos);
        
        // Determina a classe baseada na cor
        const pinClass = cor === '#1ab394' ? 'pin-green' : 'pin-red';

        const pin = $(`<div class="pin ${pinClass}" draggable="false" data-bs-toggle="tooltip" title="${title}"></div>`)
            .css({
                left: x + 'px',
                top: y + 'px'
            })
            .attr('data-id', id)
            .attr('data-nameid', nameid)
            .attr('data-title', title);

        imgContainer.append(pin);

        if (window.bootstrap?.Tooltip) {
            new bootstrap.Tooltip(pin[0]);
        }

        savePin(pin, id, nameid, title);
        console.log(contadorPinos);
    }

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
    $('[data-item="equipamentos"]').on('dragstart', function () {
        itemColor = $(this).hasClass('pin-green') ? '#1ab394' : '#e74c3c';
        itemNameID = $(this).data("nameid");
        itemTitle = $(this).data("title");
    });

    imgContainer.on('dragover', function(e) {
        e.preventDefault();
    });

    imgContainer.on('drop', function(e) {
        e.preventDefault();
        if (!itemColor) return;

        const rect = this.getBoundingClientRect();
        const x = e.originalEvent.clientX - rect.left - 7;
        const y = e.originalEvent.clientY - rect.top - 7;

        createPin(x, y, itemColor, itemNameID, itemTitle);
    });

    $(document).on('mousedown', '.pin', function(e) {
        pinDragging = $(this);
        const rect = this.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    });

    $(document).on('mousemove', function(e) {
        if (pinDragging) {
            const rectMapa = imgContainer[0].getBoundingClientRect();
            let x = e.clientX - rectMapa.left - offsetX;
            let y = e.clientY - rectMapa.top - offsetY;

            x = Math.max(0, Math.min(x, imgContainer.width() - 14));
            y = Math.max(0, Math.min(y, imgContainer.height() - 14));

            pinDragging.css({ left: x + 'px', top: y + 'px' });
            updatePinPosition(pinDragging);
        }
    });

    $(document).on('dragstart', '.pin', function(e) {
        e.preventDefault();
    });

    $(document).on('mouseup', function() {
        pinDragging = null;
    });

    $(document).on('dblclick', '.pin', function() {
        removePin($(this));
    });

    removeAllButton.on('click', function() {
        if (confirm(confirmMessage)) {
            $('.pin').each(function() {
                const tooltipInstance = bootstrap.Tooltip.getInstance(this);
                if (tooltipInstance) tooltipInstance.dispose();
            });
            $('.pin').remove();
            pinsData = [];
            updateStateClearButton();
            updateCounters();
        }
    });

    setupTogglePins();

    /** -------------------------------------------------
    * Estado inicial
    ----------------------------------------------------*/
    updateStateClearButton();
}