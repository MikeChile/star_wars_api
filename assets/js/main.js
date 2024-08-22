document.addEventListener('DOMContentLoaded', function () {

    // Variable para almacenar el identificador del rango actual
    let currentRangeId = null;

    // Función asincrónica que obtiene los datos de un personaje de la API de Star Wars por su ID
    async function fetchCharacter(id) {
        const response = await fetch(`https://swapi.dev/api/people/${id}/`);
        const data = await response.json();
        return {
            name: data.name,
            height: data.height,
            mass: data.mass,
        };
    }

    // Generador que produce personajes dentro de un rango dado y asigna un color según el rango
    function* characterGenerator(range) {
        if (!range) {
            console.error('El rango es null o undefined');
            return;
        }

        const [start, end] = range.split('-').map(Number);
        let color = '';

        if (start >= 1 && end <= 5) {
            color = '#f27f6f'; // Rojo para IDs entre 1 y 5
        } else if (start >= 6 && end <= 11) {
            color = 'rgb(96, 216, 96)'; // Verde para IDs entre 6 y 11
        } else if (start >= 12 && end <= 17) {
            color = 'rgb(64, 191, 241)'; // Azul para IDs entre 12 y 17
        }

        for (let i = start; i <= end; i++) {
            yield { character: fetchCharacter(i), color };
        }
    }

    // Función asincrónica que muestra los personajes en la página
    async function displayCharacters(range, rangeId) {
        const charactersContainer = document.getElementById('characters');
        charactersContainer.innerHTML = '';

        const generator = characterGenerator(range);
        let count = 0;

        // Itera sobre cada personaje generado por el generador
        for (let { character: characterPromise, color } of generator) {
            if (count >= 5) break; // Limita la visualización a 5 personajes

            // Verifica si el rango actual aún es válido
            if (rangeId !== currentRangeId) {
                return; // Si ha cambiado, detiene la ejecución de la función
            }

            const character = await characterPromise;

            const characterDiv = document.createElement('div');
            characterDiv.className = 'character-card';
            characterDiv.innerHTML = `
                <div class="row">
                    <div class="col-2">
                        <div style="width: 30px; height: 30px; border-radius: 50%; background-color: ${color};"></div>
                    </div>
                    <div class="col-10">
                        <h3 class="characterTitle">${character.name}</h3>
                        <p><b>Estatura:</b> ${character.height} cm, 
                        <b>Peso:</b> ${character.mass} kg</p>
                    </div>
                </div>`;

            charactersContainer.appendChild(characterDiv);
            count++;
        }
    }

    // Configura el volumen para los audios
    const backgroundAudio = document.getElementById('audio');
    const laserAudio = document.getElementById('laser');

    backgroundAudio.volume = 0.2; // Volumen del audio de fondo (más bajo)
    laserAudio.volume = 1.0; // Volumen del audio del sable láser (más alto)

    // Añade un manejador de eventos a cada elemento con la clase 'range'
    document.querySelectorAll('.range').forEach(rangeDiv => {
        rangeDiv.addEventListener('mouseenter', (e) => {
            const range = e.currentTarget.getAttribute('data-range');
            if (range) {
                // Genera un nuevo identificador único para este rango
                currentRangeId = Symbol();
                displayCharacters(range, currentRangeId);

                // Reproduce el sonido del sable láser durante 2 segundos
                laserAudio.play().catch(error => console.error('Error al reproducir el sable láser:', error));
                setTimeout(() => {
                    laserAudio.pause();
                    laserAudio.currentTime = 0; // Reinicia el audio a su posición inicial
                }, 2000);
            } else {
                console.error('No se encontró un rango válido');
            }
        });

    });

    // Manejador del botón de audio
    const audioButton = document.getElementById('audio-button');
    const audioIcon = document.getElementById('audio-icon');

    // Inicialmente, el audio está en mute
    let isMuted = true;

    // Función para alternar entre iconos y reproducir el audio de fondo
    audioButton.addEventListener('click', () => {
        if (isMuted) {
            backgroundAudio.play().catch(error => console.error('Error al reproducir el audio de fondo:', error));
            audioIcon.classList.remove('bx-volume-mute');
            audioIcon.classList.add('bx-volume-full');
        } else {
            backgroundAudio.pause();
            audioIcon.classList.remove('bx-volume-full');
            audioIcon.classList.add('bx-volume-mute');
        }
        isMuted = !isMuted;
    });
});
