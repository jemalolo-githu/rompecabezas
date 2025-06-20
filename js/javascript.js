

document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const imageInput = document.getElementById('imageInput');
    const previewImage = document.getElementById('previewImage');
    const puzzleContainer = document.getElementById('puzzleContainer');
    const shuffleButton = document.getElementById('shuffleButton');
    const rowsInput = document.getElementById('rows');
    const columnsInput = document.getElementById('columns');
    const completeMessage = document.getElementById('completeMessage');
    const timerElement = document.getElementById('timer');
    const finalTimeElement = document.getElementById('finalTime');
    
    // Variables para el juego
    let image = null;
    let pieces = [];
    let selectedPiece = null;
    let rows = 3;
    let columns = 3;
    let originalOrder = [];
    let currentOrder = [];
    let gameStarted = false;
    
    // Variables para el cronómetro
    let startTime = 0;
    let timerInterval = null;
    let elapsedTime = 0;
    
    // Controlar la carga de la imagen
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                image = new Image();
                image.src = event.target.result;
                image.onload = () => {
                    previewImage.src = event.target.result;
                    setupPuzzle();
                };
            };
            reader.readAsDataURL(file);
        }
    });

    
    // Controlar la carga de la imagen atun
    btnCargarImg0.addEventListener('click', (e) => { cargarImagenDirecta("img/imagen0.jpg",3,3);    });
    btnCargarImg1.addEventListener('click', (e) => { cargarImagenDirecta("img/imagen1.jpg",3,3);    });
    btnCargarImg2.addEventListener('click', (e) => { cargarImagenDirecta("img/imagen2.jpg",3,3);    });
    btnCargarImg3.addEventListener('click', (e) => { cargarImagenDirecta("img/imagen3.jpg",3,3);    });
    btnCargarImg4.addEventListener('click', (e) => { cargarImagenDirecta("img/imagen4.jpg",7,10);   });

    function cargarImagenDirecta(imagen,filas,columnas) {
        const imageInput = document.getElementById('imageInput');
        // Simular la selección del archivo
        imagen += `?t=${new Date().getTime()}`
        fetch(imagen)
            .then(response => response.blob())
            .then(blob => {
                // Crear un objeto File a partir del blob
                const file = new File([blob], 'imagen1.jpg', { type: blob.type });
                
                // Crear un FileList simulado
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                
                // Asignar el archivo al input
                imageInput.files = dataTransfer.files;
                
                // Disparar el evento change para que se procese como si fuera seleccionado manualmente
                const changeEvent = new Event('change', { bubbles: true });
                imageInput.dispatchEvent(changeEvent);
            })
            .catch(error => {
                console.error('Error al cargar la imagen:', error);
            });


            document.getElementById("rows").value=filas;
            document.getElementById("columns").value=columnas;
            const rowsInput=document.getElementById("rows").value;
            const columnsInput = document.getElementById("columns").value;
        
            resetTimer();
           
            
    }   
    
    
    // Configurar el rompecabezas con la configuración actual
    function setupPuzzle() {
        rows = parseInt(rowsInput.value);
        columns = parseInt(columnsInput.value);
        
        if (isNaN(rows) || rows < 2 || rows > 10 || 
            isNaN(columns) || columns < 2 || columns > 10) {
            alert('Por favor ingresa valores válidos para filas y columnas (entre 2 y 10)');
            return;
        }
        
        createPuzzle();
    }
    
    // Crear las piezas del rompecabezas
    function createPuzzle() {
        gameStarted = true;
        pieces = [];
        originalOrder = [];
        currentOrder = [];
        completeMessage.style.display = 'none';
        
        // Crear las piezas del rompecabezas
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                const piece = {
                    row: i,
                    col: j,
                    backgroundPosition: `${-j * 100}% ${-i * 100}%`,
                    backgroundSize: `${columns * 100}% ${rows * 100}%`
                };
                pieces.push(piece);
                originalOrder.push(i * columns + j);
                currentOrder.push(i * columns + j);
            }
        }
        
        // Configurar el grid
        puzzleContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        puzzleContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        
        // Calcular el aspecto y tamaño del contenedor
        const aspectRatio = image ? image.width / image.height : 4/3;
        const containerWidth = Math.min(600, window.innerWidth - 40);
        puzzleContainer.style.width = `${containerWidth}px`;
        puzzleContainer.style.height = `${containerWidth / aspectRatio}px`;
        
        renderPuzzle();
    }
    
    // Inicializar los listeners al cargar la página
    function init() {
        // Evento para cambio de filas/columnas
        rowsInput.addEventListener('change', setupPuzzle);
        columnsInput.addEventListener('change', setupPuzzle);
        
        // Evento para el botón de desordenar
        shuffleButton.addEventListener('click', () => {
            if (!gameStarted) {
                setupPuzzle();
            }
            
            shufflePieces();
            renderPuzzle();
            resetTimer();
            startTimer();
            checkCompletion();
        });
        
        // Configurar el rompecabezas inicial
        setupPuzzle();
    }
    
    // Función para renderizar el rompecabezas
    function renderPuzzle() {
        puzzleContainer.innerHTML = '';
        
        currentOrder.forEach((index, position) => {
            const piece = pieces[index];
            const pieceElement = document.createElement('div');
            pieceElement.classList.add('puzzle-piece');
            
            // Usar la imagen cargada o la predeterminada
            const imgSrc = image ? image.src : previewImage.src;
            pieceElement.style.backgroundImage = `url(${imgSrc})`;
            
            pieceElement.style.backgroundPosition = piece.backgroundPosition;
            pieceElement.style.backgroundSize = piece.backgroundSize;
            pieceElement.dataset.index = index;
            pieceElement.dataset.position = position;
            
            pieceElement.addEventListener('click', handlePieceClick);
            
            puzzleContainer.appendChild(pieceElement);
        });
    }
    
    // Manejar click en una pieza
    function handlePieceClick(e) {
        const clickedPiece = e.target;
        const position = parseInt(clickedPiece.dataset.position);
        
        if (selectedPiece === null) {
            // Primera pieza seleccionada
            selectedPiece = position;
            clickedPiece.classList.add('selected');
        } else if (selectedPiece === position) {
            // Deseleccionar si se hace clic en la misma pieza
            selectedPiece = null;
            clickedPiece.classList.remove('selected');
        } else {
            // Segunda pieza seleccionada, intercambiar
            const previouslySelected = document.querySelector('.puzzle-piece.selected');
            previouslySelected.classList.remove('selected');
            
            // Intercambiar las piezas en currentOrder
            const temp = currentOrder[selectedPiece];
            currentOrder[selectedPiece] = currentOrder[position];
            currentOrder[position] = temp;
            
            selectedPiece = null;
            renderPuzzle();
            checkCompletion();
        }
    }
    
    // Desordenar las piezas
    function shufflePieces() {
        // Algoritmo Fisher-Yates para mezclar el array
        for (let i = currentOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentOrder[i], currentOrder[j]] = [currentOrder[j], currentOrder[i]];
        }
        
    }
    
    // Verificar si el rompecabezas está completado
    function checkCompletion() {
        const isComplete = currentOrder.every((value, index) => value === originalOrder[index]);
        if (isComplete) {
            stopTimer();
            finalTimeElement.textContent = formatTime(elapsedTime);
            completeMessage.style.display = 'block';
        }
    }
    
    // Funciones del cronómetro
    function startTimer() {
        startTime = Date.now();
        elapsedTime = 0;
        timerInterval = setInterval(updateTimer, 1000);
        completeMessage.style.display = 'none';
    }
    
    function stopTimer() {
        clearInterval(timerInterval);
    }
    
    function resetTimer() {
        stopTimer();
        elapsedTime = 0;
        timerElement.textContent = "00:00:00";
    }
    
    function updateTimer() {
        elapsedTime = Date.now() - startTime;
        timerElement.textContent = formatTime(elapsedTime);
    }
    
    function formatTime(timeInMs) {
        const totalSeconds = Math.floor(timeInMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
    }
    
    function padZero(num) {
        return num.toString().padStart(2, '0');
    }

    
    // Inicializar la aplicación
    init();
});
