function capturarItem(name) {
    return document.getElementById(name);
}
function abrirModal(btnopenModal, modal, btncloseModal) {
    const open = capturarItem(btnopenModal);
    const modalContent = capturarItem(modal);
    const close = modalContent.querySelector(btncloseModal);

    open.addEventListener('click', () => modalContent.classList.add('active'));
    close.addEventListener('click', () => modalContent.classList.remove('active'));


}
abrirModal('open-modal1', 'modal1', '[data-close=modal1]');
abrirModal('open-modal2', 'modal2', '[data-close=modal2]');
abrirModal('open-modal3', 'modal3', '[data-close=modal3]');


////////////////////
const btnMenuHome = capturarItem('btnMenuHome');
const btnMenuClientes = capturarItem('btnMenuClientes');
const btnMenuFacturas = capturarItem('btnMenuFacturas');
const btnMenuProductos = capturarItem('btnMenuProductos');
const btnMenuSalir = capturarItem('btnMenuSalir');

btnMenuHome.addEventListener('click', () => {
    ContainerClientes.classList.add('content-section-disabled');
    ContainerFacturas.classList.add('content-section-disabled');
    ContainerProductos.classList.add('content-section-disabled');
    ContainerHome.classList.remove('content-section-disabled');

});

btnMenuClientes.addEventListener('click', () => {
    ContainerClientes.classList.remove('content-section-disabled');
    ContainerFacturas.classList.add('content-section-disabled');
    ContainerProductos.classList.add('content-section-disabled');
    ContainerHome.classList.add('content-section-disabled');
});

btnMenuFacturas.addEventListener('click', () => {
    ContainerClientes.classList.add('content-section-disabled');
    ContainerFacturas.classList.remove('content-section-disabled');
    ContainerProductos.classList.add('content-section-disabled');  
    ContainerHome.classList.add('content-section-disabled');
});
btnMenuProductos.addEventListener('click', () => {
    ContainerClientes.classList.add('content-section-disabled');
    ContainerFacturas.classList.add('content-section-disabled');
    ContainerProductos.classList.remove('content-section-disabled');
    ContainerHome.classList.add('content-section-disabled');
});
const ContainerClientes = capturarItem('ContainerClientes');
const ContainerFacturas = capturarItem('ContainerFacturas');
const ContainerProductos = capturarItem('ContainerProductos');
const ContainerHome = capturarItem('ContainerHome');



ContainerClientes.classList.add('content-section-disabled');
ContainerFacturas.classList.add('content-section-disabled');
ContainerProductos.classList.add('content-section-disabled');
