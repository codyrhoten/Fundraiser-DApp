import { useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { houseNftAddress, marketAddress } from '../../config';
const Marketplace = require('../../artifacts/contracts/Market.sol/Market.json');
const HouseNFT = require('../../artifacts/contracts/HouseNFT.sol/HouseNFT.json');
import axios from 'axios';
import { notify } from '../../utils/notification';
import { Button, Col, Container, Row } from 'react-bootstrap';

export default function MyHouses() {
    const [houses, setHouses] = useState([]);
    // const [loadingState, setLoadingState] = useState('not-loaded');
    const router = useRouter();

    async function loadHouses() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const houseNFTContract = new ethers.Contract(houseNftAddress, HouseNFT.abi, provider);
        const marketContract = new ethers.Contract(marketAddress, Marketplace.abi, signer);
        let myHouses = await marketContract.getMyHouses();

        myHouses = await Promise.all(myHouses.map(async h => {
            try {
                const houseURI = await houseNFTContract.tokenURI(h.houseId);
                const meta = await axios.get(houseURI);
                let price = ethers.utils.formatUnits(h.price.toString(), 'ether');
                const house = {
                    price: price - Math.floor(price) !== 0 ? price : Math.trunc(price),
                    houseId: h.houseId.toNumber(),
                    seller: h.seller,
                    owner: h.buyer,
                    address: meta.data.address,
                    imageURL: meta.data.imageURL,
                    bedrooms: meta.data.bedrooms,
                    bathrooms: meta.data.bathrooms,
                    houseSqFt: meta.data.houseSqFt,
                    lotSqFt: meta.data.lotSqFt,
                    yearBuilt: meta.data.yearBuilt,
                    houseURI,
                };
                return house;
            } catch (err) {
                if (err.message.includes('Already processing eth_requestAccounts' || 'User Rejected')) {
                    notify('Wallet', 'Please sign in to MetaMask.')
                    return null;
                }

                console.log(err);
                return null;
            }
        }));

        setHouses(myHouses.filter(house => house !== null));
        //setLoadingState('loaded');
    }

    function listHouse(house) {
        router.push(`house-resale?id=${house.houseId}&houseURI=${house.houseURI}`);
    }

    useEffect(() => { loadHouses() }, []);

    if (houses.length === 0) {
        return (
            <h4 className='mt-5 text-center'>This wallet doesn't contain any NFTs-in-Deed</h4>
        )
    } else {
        return (
            <div className='mb-4 flex justify-center'>
                <div className='px-4'>
                    <Container>
                    <h4 className='my-4 text-center'>My NFTs-in-Deed</h4>
                        <Row xs='1' lg='3' className='justify-content-md-center'>
                            {houses.map((h, i) => (
                                <Col key={i} className='shadow rounded overflow-hidden mx-2' lg={true}>
                                    <p className='text-center mt-3'><b>{h.address}</b></p>
                                    <div className='text-center'>
                                        <img src={h.imageURL} className='rounded' height='125' />
                                    </div>
                                    <p className='text-center mt-2'>{h.price} ETH</p>
                                    <p align='center'>
                                        {`${h.bedrooms} bed, ${h.bathrooms} bath, ${h.houseSqFt} sq ft home, ${h.lotSqFt} sq ft lot, built ${h.yearBuilt}`}
                                    </p>
                                    <div className='text-center'>
                                        <Button
                                            className='px-3 mx-auto mb-4'
                                            onClick={() => { listHouse(h) }}
                                        >
                                            List
                                        </Button>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </div>
            </div>
        );
    }
}