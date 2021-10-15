import React from 'react';
import { Card } from 'react-bootstrap';
import './App.scss';
import { OrderForm } from './components/OrderForm';

function App() {
  return (
    <div className="App">
      <Card>
        <Card.Header>Детали заказа</Card.Header>
        <Card.Body>
          <OrderForm />
        </Card.Body>
      </Card>
    </div>
  );
}

export default App;
