import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '../../api/apiConfig'
import detectEthereumProvider from '@metamask/detect-provider';

export default function Register() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const first_name = useRef()
    const last_name = useRef()
    const email = useRef()
    const password = useRef()
    const password2 = useRef(undefined)
    const wallet_address = useRef();

    //for getting wallet account
    const [account, setAccount] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const connectWallet = async () => {
            const provider = await detectEthereumProvider();

            if (provider) {
                if (provider !== window.ethereum) {
                    console.error('Do you have multiple wallets installed?');
                    setError('Do you have multiple wallets installed?');
                    return;
                }

                try {
                    const accounts = await provider.request({ method: 'eth_requestAccounts' });
                    setAccount(accounts[0]);

                    provider.on('accountsChanged', (accounts) => {
                        setAccount(accounts[0]);

                        wallet_address.value = account;
                    });

                    provider.on('chainChanged', () => {
                        window.location.reload();
                    });
                } catch (err) {
                    console.error(err);
                    setError('Failed to connect MetaMask');
                }
            } else {
                console.log('Please install MetaMask!');
                setError('Please install MetaMask!');
            }
        };

        connectWallet();
    }, []);

    async function onSubmitForm(event) {
        event.preventDefault()
        const data = {
            first_name: first_name.current.value,
            last_name: last_name.current.value,
            email: email.current.value,
            password: password.current.value,
            password2: password2.current.value,
            wallet_address: wallet_address.current.value
        };

        setLoading(true)

        try {
            const response = await axiosInstance.post('auth/register', JSON.stringify(data))

            setLoading(false)

            navigate('/auth/login')
        } catch (error) {
            setLoading(false)
            // TODO: handle errors
        }
    }

    return (
        <div className='container'>
            <h2>Register</h2>
            <form onSubmit={onSubmitForm}>
                <div className="mb-3">
                    <input type="text" placeholder='First Name' autoComplete='off' className='form-control' id='first_name' ref={first_name} />
                </div>
                <div className="mb-3">
                    <input type="text" placeholder='Last Name' autoComplete='off' className='form-control' id='last_name' ref={last_name} />
                </div>
                <div className="mb-3">
                    <input type="email" placeholder='Email' autoComplete='off' className='form-control' id="email" ref={email} />
                </div>
                <div className="mb-3">
                    <input type="password" placeholder='Password' autoComplete='off' className='form-control' id="password" ref={password} />
                </div>
                <div className="mb-3">
                    <input type="password" placeholder='Confirm Password' autoComplete='off' className='form-control' id="passwordConfirmation" ref={password2} />
                </div>
                <div className="mb-3">
                    <input type="text" readOnly disabled value={account} placeholder='Wallet Address' autoComplete='off' className='form-control' id="wallet_address" ref={wallet_address} />
                </div>
                <div className="mb-3">
                    <button disabled={loading} className='btn btn-success' type="submit">Register</button>
                </div>
            </form>
        </div>
    )
}
