import {TABLES, COLUMNS, state, createOrderData, updateDragging } from "./data.js";
import { createOrderHtml, html, moveToColumn, updateDraggingHtml} from "./view.js";

/**
 * A handler that fires when a user drags over any element inside a column. In
 * order to determine which column the user is dragging over the entire event
 * bubble path is checked with `event.path` (or `event.composedPath()` for
 * browsers that don't support `event.path`). The bubbling path is looped over
 * until an element with a `data-area` attribute is found. Once found both the
 * active dragging column is set in the `state` object in "data.js" and the HTML
 * is updated to reflect the new column.
 *
 * @param {Event} event 
 */
const handleDragOver = (event) => {
    event.preventDefault();
    const path = event.path || event.composedPath()
    let column = null

    for (const element of path) {
        const { area } = element.dataset
        if (area) {
            column = area
            break;
        }
    }

    if (!column) return
    updateDragging({ over: column })
    updateDraggingHtml({ over: column })
}


// dragging 
let dragged;
const handleDragStart = (event) => { 
     dragged = event.target;
};

function handleDragDrop (event) {
    event.target.append(dragged);
}

const handleDragEnd = (event) => {
     const background = event.target.closest("section");
     background.style.backgroundColor = "";
};

const handleHelpToggle = (event) => {
    html.help.overlay.style.display = "block"
}
const handleHelpCancel = (event) => {
    html.help.overlay.style.display = "none"
    html.other.add.focus()
   
}
const handleAddToggle = (event) => {
    html.add.overlay.style.display = "block"
    html.other.add.focus()
}
const handleAddCancel = () => {
    html.add.overlay.style.display = "none"
    html.other.add.focus()
}

// I fixed my code and i added elements that were missing to enable the add funtion on the app to create orders.
const handleAddSubmit = (event) => {
    event.preventDefault();
    const overlay = html.add.overlay;
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    const newData = createOrderData(data);
    const htmlData = createOrderHtml(newData);
    const append = document.querySelector('[data-area="ordered"]');
    event.target.reset();
    overlay.close();
    append.appendChild(htmlData);

};

// I added this code to enable the edit function in the app to edit orders
const handleEditToggle = (event) => {
    const overlay = html.edit.overlay;
    const cancelButton = html.edit.cancel;
    const input = html.edit.title;
    const select = html.edit.table;
    const option = html.edit.column;
    event.target.dataset.id ? overlay.show() : undefined;
    const id = event.target.dataset.id ? event.target.dataset.id : undefined;
    input.value = event.target.dataset.id
        ? event.target.querySelector(".order__title").textContent
        : undefined;
    select.value = event.target.dataset.id
        ? event.target.querySelector(".order__value").textContent
        : undefined;
    let section = document.querySelector(`[data-id="${id}"]`);
    option.value = section ? section.closest("section").dataset.area : "";
    if (event.target === cancelButton) {
        overlay.close();
    }
    html.edit.delete.id = id;
};
    
const handleEditSubmit = (event) => {
    event.preventDefault();
    const idRemove = html.edit.delete.id;
    const orderDelete = document.querySelector(`[data-id="${idRemove}"]`);
    orderDelete.remove();
    const overlay = html.edit.overlay;
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    const newData = createOrderData(data);
    const htmlData = createOrderHtml(newData);
    const appended = document.querySelector(`[data-area="${newData.column}"]`);
    appended.appendChild(htmlData);
    event.target.reset();
    overlay.close();
}

const handleDelete = (event) => {
    const idToBeDeleted = html.edit.delete.id;
    const orderToBeDeleted = document.querySelector(
        `[data-id="${idToBeDeleted}"]`
    );
    const overlay = html.edit.overlay;
    orderToBeDeleted.remove();
    overlay.close();
}

html.add.cancel.addEventListener('click', handleAddCancel)
html.other.add.addEventListener('click', handleAddToggle)
html.add.form.addEventListener('submit', handleAddSubmit)

html.other.grid.addEventListener('click', handleEditToggle)
html.edit.cancel.addEventListener('click', handleEditToggle)
html.edit.form.addEventListener('submit', handleEditSubmit)
html.edit.delete.addEventListener('click', handleDelete)

html.help.cancel.addEventListener('click', handleHelpCancel)
html.other.help.addEventListener('click', handleHelpToggle)

for (const htmlArea of Object.values(html.area)) {
   htmlArea.addEventListener('dragover', handleDragOver) 
   htmlArea.addEventListener('dragstart', handleDragStart)
   htmlArea.addEventListener('drop', handleDragDrop)
   htmlArea.addEventListener('dragend', handleDragEnd)
}
