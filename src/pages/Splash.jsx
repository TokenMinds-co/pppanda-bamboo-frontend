import React from "react";
import styled from "styled-components";
import BigLogo from "../assets/imgs/big-logo.png";
import Discord from "../assets/imgs/discord-icon.png";

const HeroBG = styled.div`
  background: rgb(252, 255, 165);
  padding: 4rem 0;
  @media (max-width: 756px) {
    height: auto;
    padding: 11vw 0;
  }
`;

const NavMenu = styled.nav`
  padding: 2rem;
`;

const NavMenuWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  background: white;
  width: 45%;
  margin: auto;
  padding: 1vw;
  border-radius: 20px;
  @media (max-width: 756px) {
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

const NavItemClaim = styled.a`
  font-size: 1.2vw;
  color: black;
  @media (max-width: 756px) {
    font-size: 3vw;
    margin: 2vw;
  }
`;

const BigLogoWrap = styled.div``;
const BigLogoImg = styled.img`
  width: 80%;
  margin: 0 auto;
`;

const GreenButton = styled.button`
  background: #00d487;
  width: 14%;
  color: white;
  padding: 0.6vw;
  border: solid 3px green;
  border-radius: 10px;
  margin: 0 auto;
  font-size: 1.2vw;
  display: flex;
  align-items: center;
  justify-content: space-around;
  @media (max-width: 756px) {
    width: 41%;
    font-size: 3vw;
  }
`;
const GreenBtnWrap = styled.div`
  display: grid;
`;

const DiscordImg = styled.img``;

export default function Splash() {
  return (
    <HeroBG id="home">
      <NavMenu>
        <NavMenuWrap>
          <NavItem>Home</NavItem>
          <NavItem href="#mint">Mint Pandas</NavItem>
         <NavItem href="#rarity">Rarity</NavItem>
          <NavItem href="#roadmap">Roadmap</NavItem>
          <NavItem href="#faq">FAQs</NavItem>
          <NavItem href="/claim">Claim Bamboo</NavItem>
        </NavMenuWrap>
      </NavMenu>
      <BigLogoWrap>
        <BigLogoImg src={BigLogo} />
      </BigLogoWrap>
      <GreenBtnWrap>
        <GreenButton onClick={() => window.open("https://discord.gg/PPPandas")}>
          Join Discord
          <DiscordImg src={Discord} />
        </GreenButton>
      </GreenBtnWrap>
    </HeroBG>
  );
}
