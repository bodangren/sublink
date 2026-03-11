import '@testing-library/jest-dom'

HTMLDialogElement.prototype.showModal = function() {
  this.setAttribute('open', 'true')
}

HTMLDialogElement.prototype.close = function() {
  this.removeAttribute('open')
}
