import React from "react";
import { Form, Button, FloatingLabel } from "react-bootstrap";
import { pageTemplate, form, h1 } from "./styles/createNFT";
import { useState } from "react";
import { ethers } from "ethers";
// import { Redirect } from "react-router-dom";
import { NFTStorage, File } from "nft.storage";
import Web3Modal from "web3modal";
import { affeMarketAddress, mintArtAddress } from "../../config";
import AffeMarket from "../../artifacts/contracts/AffeMarket.sol/AffeMarket.json";
import MintArt from "../../artifacts/contracts/MintArt.sol/MintArt.json";

// NFT.Storage connection
const apiKey = process.env.NFTSTORAGE_KEY;
const client = new NFTStorage({ token: apiKey });

export default function CreateNFT() {
  const [file, setFile] = useState(null);
  const [formInput, setFormInput] = useState({
    name: "",
    artPiece: "",
    price: "",
    description: "",
  });

  // Getting information for metadata from state and passing to nft.storage
  async function onChange(event) {
    // Assigns the uploaded file
    const files = event.target.files[0];
    try {
      const metadata = await client.store({
        image: new File([files]),
      });
      // Gets url of nft from nft.storage
      const url = metadata.url;
      // Sets File state from nft.storge's url
      setFile(url);
    } catch (error) {
      console.log(error);
    }
  }
  async function createAffeItem() {
    const { name, artPiece, price, description } = formInput;
    if (!name || !artPiece || !price || !description || !file) return;
    //  Change form info into string for nft.storage metadata
    const data = JSON.stringfy({
      name,
      artPiece,
      price,
      description,
      image: file,
    });

    try {
      const metadata = await client.store(data);
      const url = metadata.url;
      createNFTToken(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function createNFTToken(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    // Connect to user's wallet
    const provider = new ethers.providers.Web3Provider(connection);
    // Get account of wallet
    const signer = provider.getSigner();
    // Calling contract from the blockchain
    let contract = new ethers.Contract(mintArtAddress, MintArt.abi, signer);
    // Calling specific function fron the contract
    let transaction = await contract.createNFT(url); // create new token contract
    let action = await transaction.wait(); // wait for transaction to be mined to verify transaction was successful

    // get info from NFT Contract
    let event = action.events[0]; // get the latest event that was fired
    let value = event.args[2];
    let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, "matic");
    contract = new ethers.Contract(affeMarketAddress, AffeMarket.abi, signer);
    let listingFee = await contract.getListingfee();
    listingFee = listingFee.toString();

    transaction = await contract.createAffeItem(mintArtAddress, tokenId, price, {
      value: listingFee,
    });
    await transaction.wait();

    return (
      <div style={pageTemplate}>
        <fieldset style={form}>
          <div style={h1}>
            <h1>Curate NFT</h1>
          </div>

          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Artist Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Artist Name"
                onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Name of Art Piece</Form.Label>
              <Form.Control
                type="text"
                placeholder="Art Name"
                onChange={(e) => setFormInput({ ...formInput, artPiece: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Price In Matic</Form.Label>
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
              <Form.Control type="file" />
            </Form.Group>
            <Button
              style={{ backgroundColor: "#fdbe02", border: "none" }}
              type="submit"
              onClick={createAffeItem}
            >
              Submit
            </Button>
          </Form>
        </fieldset>
      </div>
    );
  }
}
