import { Card } from 'react-bootstrap';
import { Provider } from 'react-redux';
import store from '../redux/store';
import './App.scss';
import { OrderForm } from './components/orderForm/OrderForm';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <Card>
          <Card.Header>Детали заказа</Card.Header>
          <Card.Body>
            <OrderForm />
          </Card.Body>
        </Card>
      </div>
    </Provider>
  );
}
export default App;
