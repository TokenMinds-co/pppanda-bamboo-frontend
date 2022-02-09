import React, { Component, Fragment, useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { DownloadOutlined } from "@ant-design/icons";
import RmIcon1 from "../assets/imgs/roadmap-panda-1.png";
import RmIcon2 from "../assets/imgs/roadmap-panda-2.png";
import RmIcon3 from "../assets/imgs/roadmap-panda-3.png";
import RmIcon4 from "../assets/imgs/roadmap-panda-4.png";
import RmIcon5 from "../assets/imgs/roadmap-panda-5.png";
import RmIcon6 from "../assets/imgs/roadmap-panda-6.png";
import RmIcon7 from "../assets/imgs/roadmap-panda-7.png";
import roadMapImg from "../assets/imgs/PPP PROJECT ROADMAP_1510.png";
import checkmark from "../assets/imgs/checkmark-48.png";
import PurplePandaImg from "../assets/imgs/panda-big.png";
import Pandas1 from "../assets/imgs/pandas3.png";
import { useWeb3React } from "@web3-react/core"
import { injected } from "../components/wallet/connectors"
import { Contract } from '@ethersproject/contracts'
import { AddressZero } from '@ethersproject/constants'
import { getAddress } from '@ethersproject/address'
import { constants } from "../contracts/bamboo";
import { BigNumber } from '@ethersproject/bignumber'

function isAddress(value){
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

function calculateGasMargin(chainId, value) {
  return chainId === 10 || chainId === 69
    ? value
    : value.mul(BigNumber.from(10000 + 2000)).div(BigNumber.from(10000))
}

export default function Claim() {
  const { active, account, library, connector, activate, deactivate, chainId } = useWeb3React()
  const [claimableBalance, setClaimableBalance] = useState(0);
  const [status, setStatus] = useState(0);
  const [symbol, setSymbol] = useState("$BAMBOO");
  const [result, setResult] = useState(0);
  const [txId, setTxId] = useState("");
  useEffect(() => {
    console.log('refresh');    
    refresh()
  },[active, account, library])

  useEffect(() => {
    checkTx();
  }, [status])

  const checkTx = () => {
    if (library) {
      const txId = localStorage.getItem('PENDING_TX') 
      console.log('txId', txId)
      if (txId && txId != ''){                
          library.getTransactionReceipt(txId).then((receipt) => {
            console.log('getTransactionReceipt', receipt)
            if (receipt) {                                       
              localStorage.setItem('PENDING_TX', "") 
              setStatus(0)   
              setTxId(receipt.transactionHash);
              if (receipt.status == true){
                setResult(1);      
              } else {
                setResult(-1);      
              }              
            } else {              
              setTimeout(checkTx, 1000);                                         
            }            
          })
      }      
   } 
  }

  const refresh = async () => {    
    if (chainId != 3 && chainId !=1 ) return;
    console.log('refresh', active, account, library);
    if (active && library && account){
      const contractInfo = constants[chainId];
      console.log('constants', chainId, constants)
      const bambooContract = getContract(contractInfo.CONTRACT_ADDRESS, contractInfo.CONTRACT_ABI, library, account);
      bambooContract
      .getHolderClaimableTotalAmount(account, {})
      .then((response) => {
        console.log('getHolderClaimableTotalAmount', BigNumber.from(response).div(BigNumber.from(10).pow(contractInfo.DECIMALS)).toNumber())
        setClaimableBalance(BigNumber.from(response).div(BigNumber.from(10).pow(contractInfo.DECIMALS)).toNumber());
        setSymbol(contractInfo.SYMBOL);
      })
      .catch((error) => {
          console.log('getHolderClaimableTotalAmount error', error)
          setClaimableBalance(0);
      })
    }
  }

  const getSigner = (library, account) => {
    console.log('getSigner', library, account)
    return library.getSigner(account).connectUnchecked()
  }

  // account is optional
  const getProviderOrSigner = (library, account) => {
    console.log('getProviderOrSigner', library, account)
    return account ? getSigner(library, account) : library
  }

  const getContract = (address, ABI, library, account) => {
    if (!isAddress(address) || address === AddressZero) {
      throw Error(`Invalid 'address' parameter '${address}'.`)
    }
    return new Contract(address, ABI, getProviderOrSigner(library, account))
  }

  const connect = async () => {
    try {
      await activate(injected)      
    } catch (ex) {
      console.log(ex)
    }
  }

  const disconnect = async () => {
    try {
      deactivate()
    } catch (ex) {
      console.log(ex)
    }
  }


  const onClickClaim = async () => {    
    if (!library) console.log('no library', library);
    if (claimableBalance == 0){
      alert("You're not eligible for $BAMBOO claim.");
      return;
    }
    console.log('clicked claim chainId', chainId);
    console.log('contract address', constants[chainId].CONTRACT_ADDRESS)
    setTxId('');
    setResult(0);
    const contractInfo = constants[chainId];
    const bambooContract = getContract(contractInfo.CONTRACT_ADDRESS, contractInfo.CONTRACT_ABI, library, account);
    const fragment = bambooContract.interface.getFunction('claim');
    const callData = bambooContract.interface.encodeFunctionData(fragment, [])
    const tx = { from: account, to: contractInfo.CONTRACT_ADDRESS, data: callData}
    library.estimateGas(tx)
              .then((gasEstimate) => {
                console.log('gasEstimate', gasEstimate);
                console.log('library', library);
                library.getSigner().sendTransaction({                 
                  to: contractInfo.CONTRACT_ADDRESS,
                  data: callData,                                                           
                  gasLimit: calculateGasMargin(chainId, gasEstimate).toNumber(),             
                })
                .then((response) => {
                  console.log('response', response);
                  localStorage.setItem('PENDING_TX', response.hash);
                  setStatus(1);
                  return response.hash
                })
                .catch((error) => {
                  // if the user rejected the tx, pass this along
                  if (error?.code === 4001) {
                    alert('Transaction rejected.')
                  } else {
                    // otherwise, the error was unexpected and we need to convey that
                    alert(`Tx failed`)
                  }
                })
              })
              .catch((gasError) => {
                console.log('gas err', gasError);
              })    
  }
  return (
    <Wrap id="claim">
      <NavMenu>
        <NavMenuWrap>
          <NavItem href="/">Home</NavItem>
          <NavItem href="/#mint">Mint Pandas</NavItem>
          <NavItem href="/#rarity">Rarity</NavItem>
          <NavItem href="/#roadmap">Roadmap</NavItem>
          <NavItem href="/#faq">FAQs</NavItem>
          <SelNavItem href="/claim">Claim Bamboo</SelNavItem>
        </NavMenuWrap>
      </NavMenu>
      <Heading>Claim $BAMBOO Token</Heading>
      <InnerWrap>
            {/*  Purple Panda Image */}
            <PurplePanda alt="Purple Panda Image" src={PurplePandaImg} />
      </InnerWrap>

      <GreenBtnWrap>

      {!active && <GreenButton onClick={connect}>
          Connect Wallet
      </GreenButton>}
      {active ? <Account>Connected with <b>{account}</b></Account> : <Account>Not connected</Account>}
      {active && <Account>Claimable Balance: {claimableBalance} {symbol}</Account>}
      {active && <GreenButton onClick={disconnect}>
          Disconnect Wallet
      </GreenButton>}
      </GreenBtnWrap>     
      <GreenBtnWrap>      
      {result == 1 && <Account style={{color: "green"}}>Success! Please check your claim transaction <a target="_blank" href={`https://ropsten.etherscan.io/tx/${txId}`}>here</a>!</Account>}
      {result == -1 && <Account style={{color: "red"}}>Failed! Please check your claim transaction <a target="_blank" href={`https://ropsten.etherscan.io/tx/${txId}`}>here</a>!</Account>}
        <GreenButton onClick={onClickClaim} disabled={!active || status == 1}>
          { status == 0? "Claim $BAMBOO" : "Processing Claim" }
        </GreenButton>
      </GreenBtnWrap>
      <PandaWrap>
          <PandaImg src={Pandas1} alt="" />
          {/* <PandaImg left src={Pandas2} alt="" /> */}
      </PandaWrap>
    </Wrap>
  );
}

const Wrap = styled.div`
  padding-top: 4vw;
  //background: rgb(252, 255, 165);
  background: url("PPPandas_Asset_Dot.png");
`;

const Heading = styled.h2`
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  font-size: 1.7vw;
  color: #292929;
  text-align: center;
  font-weight: bold;
  @media (max-width: 764px) {
    font-size: 5.5vw;
  }
`;

const NavMenu = styled.nav`
  padding: 2rem;
`;

const NavMenuWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  margin: auto;
  padding: 1vw;
  border-radius: 20px;
  width: 45%;
  background-color: #fff;
  @media (max-width: 756px) {
    background: white;
    width: 100%;
    flex-direction: column;
  }
`;

const NavItem = styled.a`
  font-size: 1.2vw;
  color: black;
  @media (max-width: 756px) {
    font-size: 3vw;
    margin: 2vw;
  }
`;

const SelNavItem = styled.a`
  font-size: 1.2vw;
  color: black;
  @media (max-width: 756px) {
    font-size: 3vw;
    margin: 2vw;
  }
`;

const InnerWrap = styled.div`
  justify-content: center;
  margin: 20px auto;
  display: flex;
`;

const PurplePanda = styled.img`
  width: 20%;
  border-radius: 100%;
  //border: solid #761476 3px;
  @media (max-width: 756px) {
    width: 40%;
    margin: 4vw auto;
  }
`;

const GreenButton = styled.button`
  
  background: ${props => props.disabled ? '#808080' : '#00d487'};
  width: 250px;
  font-weight: bold;
  color: black;
  padding: 0.6vw;
  border: solid 10px rgba(252, 255, 205);
  //border:none;
  border-radius: 20px;
  margin: 20px auto;
  font-size: 1.2vw;
  display: flex;
  align-items: center;
  justify-content: space-around;
  cursor: pointer;
  @media (max-width: 756px) {
    width: 41%;
    font-size: 3vw;
  }

  &:hover {
    color: ${props => props.disabled ? 'black' : 'white'};
  }
`;

const GreenBtnWrap = styled.div`
  display: grid;
`;

const PandaWrap = styled.div`
  justify-content: center;
  display: flex;
  grid-template-columns: 1fr 1fr;
  //transform: translate(30px, 0px);
  margin-top: 4rem;
  @media (max-width: 756px) {
    transform: translate(0, 0);
    grid-template-columns: 1fr;
  }
`;

const PandaImg = styled.img`
  @media (max-width: 756px) {
    width: 100%;
  }
`;

const Account = styled.span`
text-align: center;
font-size: 30px;
`;
