import React, { useEffect, useState } from 'react'
import useAuth from '../hooks/useAuth'
import useUser from '../hooks/useUser';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';

export default function Home() {
    const { user } = useAuth();
    const getUser = useUser()
    const [account, setAccount] = useState(null);
    const [ethBalance, setEthBalance] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
        getUser()
    }, []);

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

                    const web3 = new Web3(provider);

                    // Fetch the balance in Ether (ETH)
                    const balance = await web3.eth.getBalance(accounts[0]);
                    setEthBalance(web3.utils.fromWei(balance, 'ether'));

                    provider.on('accountsChanged', (accounts) => {
                        setAccount(accounts[0]);
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

    if (user?.email !== undefined) {
        return (
            <div className='container mt-3'>
                <h2>
                    <div className='row'>
                        <div className="mb-12">
                            Welcome To connect Account: {account}
                            <br />
                            Your Balance: {ethBalance}
                        </div>
                    </div>
                </h2>
            </div>
        )
    }
    else {
        return (
            <div className='container mt-3'>
                <h2>
                    <div className='row'>
                        <div className="mb-12">
                            Please login first
                        </div>
                    </div>
                </h2>
            </div>
        )
    }

}
