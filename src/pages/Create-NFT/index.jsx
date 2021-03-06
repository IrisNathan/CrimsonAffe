import { Form, Button, FloatingLabel } from "react-bootstrap";
import { pageTemplate, form, h1 } from "./styles/createNFT";
import React, { useState } from "react";
import { ethers } from "ethers";
import { Redirect } from "react-router-dom";
import { ROUTES } from "../../utils/constants/routes";
import { NFTStorage, File} from "nft.storage";
import { affeMarketAddress, mintArtAddress } from "../../config";
import AffeMarket from "../../artifacts/contracts/AffeMarket.sol/AffeMarket.json";
import MintArt from "../../artifacts/contracts/MintArt.sol/MintArt.json";


// NFT.Storage connection
const apiKey = process.env.REACT_APP_NFTSTORAGE_KEY;
const client = new NFTStorage({ token: apiKey });

var url

export default function CreateNFT() {
  const [formInput, setFormInput] = useState({
    name: "",
    nftPrice: "",
    description: "",
    image: "",
  });
  const [file, setFile] = useState(null);

  // Getting information for metadata from state and passing to nft.storage
  async function onFile(event) {
    // Assigns the uploaded file
    const files = event.target.files;
    let fileName = files[0].name;
    // alert(fileName);

    try {
      const metadata = await client.store({
        name: formInput.name,
        description: formInput.description,
        image: new File([files], fileName, { type: "image/jpg" }),
      });

      let path = metadata.ipnft;

      console.log(path);

        url = `https://api.nft.storage/${path}`
      //  url = `https://ipfs.infura.io/ipfs/${path}/metadata.json`
      // url = `https://${path}.ipfs.infura-ipfs.io/metadata.json`
      console.log(url);
      setFile(url);
    } catch (error) {
      console.log(error);
    }
  }

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts"});
  }
  // Creating NFT token

  async function createNFTToken() {
    // Connect to user's wallet
    await requestAccount();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // Get account of wallet
    const signer = provider.getSigner();
    // Calling MintArt contract from the blockchain
    let contract = new ethers.Contract(mintArtAddress, MintArt.abi, signer);
    // Calling specific function from the contract
    let transaction = await contract.createNFT(url); // create new token contract
    let tx = await transaction.wait(); // wait for transaction to be mined to verify transaction was successful

    // get emmitted events from the Affemarket contract
    let event = tx.events[0]; // get the latest event that was fired
    // getting the third indexed event from the Affemarket contract
    let value = event.args[2];
    let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, "ether");
    // calling the affemarket contract from the blockchain
    contract = new ethers.Contract(affeMarketAddress, AffeMarket.abi, signer);
    // getting function from the affemarket contract
    let listingFee = await contract.getListingFee();
    listingFee = listingFee.toString();
    // calling the mintart contract and creating a nft token
    transaction = await contract.createAffeItem(mintArtAddress, tokenId, price, {
      value: listingFee,
    });
    await transaction.wait();
    return <Redirect to={ROUTES.gallery} />; 
  }

  return (
    <div style={pageTemplate}>
      <fieldset style={form}>
        <div style={h1}>
          <h1>Curate NFT</h1>
        </div>

        <Form className="nft-info">
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Art Name"
              onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="text"
              placeholder="Price"
              onChange={(e) => setFormInput({ ...formInput, price: e.target.value })}
            />
          </Form.Group>

          <FloatingLabel controlId="floatingTextarea2" className="mb-2" label="Description">
            <Form.Control
              as="textarea"
              placeholder="Description of Art"
              style={{ height: "100px" }}
              onChange={(e) => setFormInput({ ...formInput, description: e.target.value })}
            />
          </FloatingLabel>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Upload File</Form.Label>
            {/* {file && <img className='rounded mt-4' width= '350' height='350' src={file} alt='nft art' />} */}
            <Form.Control type="file" onChange={onFile} />
          </Form.Group>
          <Button style={{ backgroundColor: "#fdbe02", border: "none" }} onClick={createNFTToken}>
            Create NFT
          </Button>
        </Form>
      </fieldset>
    </div>
  );
}
