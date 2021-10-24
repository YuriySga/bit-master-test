import { Button, Modal } from "react-bootstrap";

interface IOrderFormModal {
  children: React.ReactNode,
  showModal: boolean,
  closeModal: () => void,
}

export const OrderFormModal = ({ children, showModal, closeModal }: IOrderFormModal) => {
  return (
    <Modal show={showModal} animation={true}>
      <Modal.Header>
        <Modal.Title>Заказ принят!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => closeModal()}>OK</Button>
      </Modal.Footer>
    </Modal>
  );
};