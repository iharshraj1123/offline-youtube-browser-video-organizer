let boxes = Array.from(document.getElementsByClassName('box'));

function selectBox (id) {
    boxes.forEach(b => {
        b.classList.toggle('selected', b.id === id);
    });
}

boxes.forEach(b => {
    let id = b.id;
    b.addEventListener('click', e => {
        history.pushState({id}, `Selected: ${id}`, `./selected=${id}`)
        selectBox(id);
    });
});

window.addEventListener('popstate', e => {
    selectBox(e.state.id);
});

history.replaceState({id: null}, 'Default state', './');
