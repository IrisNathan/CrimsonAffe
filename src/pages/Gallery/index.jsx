import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Web3modal from 'web3modal';
import axios from 'axios';
import { pageTemplate } from './styles/gallery';
import image1 from '../assets/MarcelStrauss/marcelstrauss1.jpg';
import image2 from '../assets/MarcelStrauss/marcelstrauss2.jpg';
import image3 from '../assets/MarcelStrauss/marcelstrauss3.jpg';
import image4 from '../assets/MarcelStrauss/marcelstrauss4.jpg';
import image5 from '../assets/MarcelStrauss/marcelstrauss5.jpg';
import image6 from '../assets/spacecowboy/spacecowboy1.jpeg';
import image7 from '../assets/spacecowboy/spacecowboy2.jpeg';
import image8 from '../assets/spacecowboy/spacecowboy3.jpeg';
import image9 from '../assets/spacecowboy/spacecowboy4.jpeg';
import image10 from '../assets/spacecowboy/spacecowboy5.jpeg';


import { affeMarketAddress, mintArtAddress } from '../../config';
import AffeMarket from '../../artifacts/contracts/AffeMarket.sol/AffeMarket.json';
import MintArt from '../../artifacts/contracts/MintArt.sol/MintArt.json';


export default function Gallery() {
  // const [nfts, setNfts] = useState([]);
  // const [upload, setUpload] = useState('not-loaded');

  // useEffect(() => {
  //   loadNfts();
  // }, []);


  const images = [
    {
      id: 1,
      src: image1,
      title: 'Color Bubble',
      description: 'Dimensional Colorful Circles',
      price: 175,
    },
    {
      id: 2,
      src: image2,
      title: 'Crismson Sea',
      description: 'Shades of red in the void',
      price: 1250,
    },
    {
      id: 3,
      src: image3,
      title: 'Cotton Candy',
      description: 'Liquid Cotton Candy',
      price: 400,
    },
    {
      id: 4,
      src: image4,
      title: 'Dark Skies',
      description: 'Thunderstorms in Sunlight',
      price: 275,
    },
    {
      id: 5,
      src: image5,
      title: 'Dark Skies 2',
      description: 'Thunderstorms in Sunlight',
      price: 275,
    },
  ]

  const photos = [
    {
      id: 1,
      src: image6,
      title: 'Color Bubble',
      description: 'Dimensional Colorful Circles',
      price: 175,
    },
    {
      id: 2,
      src: image7,
      title: 'Crismson Sea',
      description: 'Shades of red in the void',
      price: 1250,
    },
    {
      id: 3,
      src: image8,
      title: 'Cotton Candy',
      description: 'Liquid Cotton Candy',
      price: 400,
    },
    {
      id: 4,
      src: image9,
      title: 'Dark Skies',
      description: 'Thunderstorms in Sunlight',
      price: 275,
    },
    {
      id: 5,
      src: image10,
      title: 'Dark Skies 2',
      description: 'Thunderstorms in Sunlight',
      price: 275,
    },
  ]

  async function loadNfts() {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.REACT_APP_MUMBAI_URL
    );
    const tokenContract = new ethers.Contract(
      mintArtAddress,
      MintArt.abi,
      provider
    );
    const marketContract = new ethers.Contract(
      affeMarketAddress,
      AffeMarket.abi,
      provider
    );
    const data = await marketContract.getAffeItems();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), 'ethers');
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          //image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
  //   setNfts(items);
  //   setUpload('loaded');
  }

  async function buyNft(nft) {
    const web3Modal = new Web3modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const tokenContract = new ethers.Contract(
      affeMarketAddress,
      AffeMarket.abi,
      signer
    );
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ethers');

    const transaction = await tokenContract.createAffeSale(
      mintArtAddress,
      nft.tokenId,
      {
        value: price,
      }
    );
    await transaction.wait();
    loadNfts();
  }

  // if (upload === 'loaded' && !nfts.length) {
  //   return <h1 className='text-center px-20 py-10'>No NFTs available</h1>;
  // }

  return (
    <>
      <div style={pageTemplate}>
        <div className='card-group'>
          {images.map((nft, index) => (
            <div className='card my-3 mx-3' key={index}>
              <img src={nft.src} className='card-img-top' alt='nft cards' />
              <div className='card-body'>
                <h5 style={{color: '#8a0000'}} className='card-title'>{nft.title}</h5>
                <p className='card-text'>{nft.description}</p>
                <p style={{color: '#262a2c'}} className='card-text'>{nft.price} Matic</p>
              </div>
              <div className='card-footer d-grid justify-content-mx-auto-center'>
                <button
                  className='btn btn-lg'
                  style={{ backgroundColor: '#fdbe02', border: 'none' }}
                  onClick={() => buyNft(nft)}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className='card-group'>
          {photos.map((nft, index) => (
            <div className='card my-3 mx-3' key={index}>
              <img src={nft} className='card-img-top' alt='nft cards' />
              <div className='card-body'>
              <h5 style={{color: '#8a0000'}} className='card-title'>{nft.title}</h5>
                <p className='card-text'>{nft.description}</p>
                <p style={{color: '#262a2c'}} className='card-text'>{nft.price} Matic</p>
              </div>
              <div className='card-footer d-grid justify-content-mx-auto-center'>
                <button
                  className='btn btn-small btn'
                  style={{ backgroundColor: '#fdbe02', border: 'none' }}
                  onClick={() => buyNft(nft)}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
