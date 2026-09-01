const button = document.getElementById('click-me');
const message = document.getElementById('message');

button.addEventListener('click', () => {
    message.textContent = 'You clicked the button!';
});
