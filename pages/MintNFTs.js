import styles from '../styles/Home.module.css';
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair, Connection, clusterApiUrl } from "@solana/web3.js";
import { useMetaplex } from "./useMetaplex";

export const MintNFTs = ({ onClusterChange }) => {
  const { metaplex } = useMetaplex();
  const wallet = useWallet();
  const candyMachineAddress = new PublicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ID);
  //const collectionAuthority=Keypair.generate();//collection nft作為簽名者的更新權限
  const collectionAuthority_pub=new PublicKey('2StXSu3USCUEvFVjMPWx1EnrfoP9JWa9XZDhtHF7HTNt');//collection授權人
  const [setNft] = useState(null);
  let candyMachine;//宣告
  const checkEligibility = async () => {
    //從鏈上圖取糖果機資料
    candyMachine = await metaplex
        .candyMachines()
        .findByAddress({ address: candyMachineAddress });
    console.log(metaplex.candyMachines())
    //console.log('collectionAuthority公鑰',collectionAuthority.publicKey.toString())
  };
  const onClick = async () => {
    console.log('薄荷');
    const { nft } = await metaplex.candyMachines().mint({
      candyMachine:candyMachine,
      collectionUpdateAuthority: collectionAuthority_pub,
    });
    console.log('薄荷完成')
  };

  if (!wallet.connected) {
    return null;
  }else {
    checkEligibility();
  }//連上錢包後取得鏈上糖果機資料

  return (
    <div>
      <div>
        <div className={styles.container}>
          <div className={styles.nftForm}>
            <button onClick={onClick}>Mint NFT</button>
          </div>
        </div>
      </div>
    </div>
  );
};
