import React, {useState, useEffect} from 'react'
import {Paper, Stepper, Step, StepLabel, Typography, CircularProgress, Divider, Button, CssBaseline} from '@material-ui/core'
import { Link, useHistory } from 'react-router-dom'

import {commerce} from '../../../lib/commerce'
import useStyles from './styles'
import AddressForm from '../AddressForm'
import PaymentForm from '../PaymentForm'

const steps = ['Shipping adress', 'Payment details']

const Checkout = ({cart, order, onCaptureCheckout, error, onEmptyCart}) => {
    const [activeStep, setActiveStep] = useState(0);
    const [checkoutToken, setCheckoutToken] = useState(null);
    const [shippingData, setShippingData] = useState({});
    const classes = useStyles();
    const history = useHistory();

    const nextStep = () => setActiveStep((prevActiveStep) => prevActiveStep + 1);
    const backStep = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);

    useEffect(() => {
        const generateToken = async () => {
            try {
                const token = await commerce.checkout.generateToken(cart.id, {type: 'cart'});
                setCheckoutToken(token);
            } catch (error) {
                history.pushState('/');
            }
        }
        generateToken();
    }, [cart]);

    

    const next = (data) => {
        setShippingData(data);

        nextStep();
    }

   let Confirmation = () => order.customer ? (
        <>
        <div>
            <Typography variant="h5"> Thank you for your purchase, {order.customer.firstname} {order.customer.lastname}</Typography>
            <Divider className={classes.divider}></Divider>
            <Typography variant="subtitle2">Order ref: {order.customer_reference}</Typography>
            <br></br>
            <Button component={Link} to="/" variant="outlined" type="button"> Back to Home</Button>
        </div>
        </>
    ) : (
        <div className={classes.spinner}>
            <CircularProgress></CircularProgress>
        </div>
    )
    if(error){
        <>
        <Typography variant="h5"> Error: {error}</Typography>
        <br></br>
        <Button component={Link} to="/" variant="outlined" type="button"> Back to Home</Button>
        </>
    }

    const Form = () => activeStep === 0
    ? <AddressForm checkoutToken={checkoutToken} next={next}></AddressForm>
    : <PaymentForm shippingData={shippingData} checkoutToken={checkoutToken} nextStep={nextStep} backStep={backStep} onCaptureCheckout={onCaptureCheckout} onEmptyCart={onEmptyCart} ></PaymentForm>

    //Render JSX => useEffect => Re-Render
    
    return (
        <>
        <CssBaseline></CssBaseline>
            <div className={classes.toolbar}></div>
            <main className={classes.layout}>
                <Paper className={classes.paper}>
                    <Typography variant="h4" align="center">Checkout</Typography>
                    <Stepper activeStep={activeStep} className={classes.stepper}>
                        {steps.map((step) => (
                            <Step key={step}>
                                <StepLabel>{step}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    {activeStep === steps.length ? <Confirmation /> : checkoutToken && <Form />}
                </Paper>
            </main>
        </>
    )
}

export default Checkout
