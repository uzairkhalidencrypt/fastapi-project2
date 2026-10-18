import React, { useState } from "react";
import { Link } from "react-router-dom";

function Cal() {

    //usestates    
    const [prevValue, setPrevValue] = useState('');
    const [currentValue, setCurrentValue] = useState('');
    const [operations, setOperations] = useState('');

    //business logic

    const handleDigit = (digit) => {
        setCurrentValue(currentValue + digit);
    }


    const handleOperator = (selectedOperation) => {
        setPrevValue(currentValue);
        setOperations(selectedOperation);
        setCurrentValue('');

    }

    const calculate = () => {
        const prev = parseFloat(prevValue);
        const current = parseFloat(currentValue);

        let outcome = 0;

        if (operations === '+') {
            outcome = prev + current;
        }
        else if (operations === '-') {
            outcome = prev - current;
        }
        else if (operations === '*') {
            outcome = prev * current;
        }
        else if (operations === '/') {
            outcome = prev / current;
        }
        setCurrentValue(String(outcome));
        setPrevValue('');
        setOperations('');
    }

    const clear = () => {
        setPrevValue('');
        setCurrentValue('');

    }
    const button = [
        '+', '-', '/', '*', 'C', '='
        , '1', '2', '3', '4', '5',
        '6', '7', '8', '9', '0'

    ];
    return (
        <div style={{ maxWidth: '300px', margin: 'auto', fontFamily: 'sans-serif' }}>
            <nav>
                <Link to="/cal">Cal</Link> |{" "}
                <Link to="/timer">Timer</Link> |{" "}
            </nav>
            <div style={{
                background: '#333',
                color: '#fff',
                fontSize: '2rem',
                textAlign: 'right',
                padding: '15px',
                marginBottom: '10px',
                minHeight: '40px',
                wordBreak: 'break-all'
            }}>
                {currentValue || prevValue || '0'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {button.map((btn, index) => {
                    const handleClick = () => {
                        switch (btn) {
                            case 'C':
                                return clear();
                            case '=':
                                return calculate();
                            case '+':
                            case '-':
                            case '*':
                            case '/':
                                return handleOperator(btn);
                            default:
                                return handleDigit(btn);
                        }
                    };


                    return (
                        <button
                            key={index}
                            onClick={handleClick}
                            style={{
                                padding: '20px',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                backgroundColor: btn === '=' ? '#4CAF50' : btn === 'C' ? '#f44336' : '#f1f1f1',
                                color: (btn === '=' || btn === 'C') ? '#fff' : '#000'
                            }}
                        >
                            {btn}
                        </button>
                    );


                })}

            </div>

        </div>
    );
}
export default Cal;

