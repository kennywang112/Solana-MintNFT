import styles from '../styles/Home.module.css';
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair,LAMPORTS_PER_SOL, Connection, clusterApiUrl } from "@solana/web3.js";
import { nftStorage } from "@metaplex-foundation/js-plugin-nft-storage";//npm install @metaplex-foundation/js-plugin-nft-storage
import { useMetaplex } from "./useMetaplex";
import { sol, toBigNumber, toDateTime } from "@metaplex-foundation/js";
import { token } from '@metaplex-foundation/js';

export const Candy= ({ onClusterChange }) => {
  const wallet = useWallet();
  const meeeAuthority = new PublicKey('2StXSu3USCUEvFVjMPWx1EnrfoP9JWa9XZDhtHF7HTNt');
  const collectionAuthority=Keypair.generate();//collection nft作為簽名者的更新權限
  const { metaplex } = useMetaplex();
  metaplex.use(nftStorage());//上傳json metadata需要先選擇存儲，默認Bundlr 將用於上傳到 Arweave
  let candyMachine;
  let walletBalance;
  const checkEligibility = async () => {

  };

  const onClick = async () => {
    console.log('clicked')
    console.log('上傳json metadata');
    const { uri } = await metaplex.nfts().uploadMetadata({
        name: "Kenny NFT",
        description: "成功了！",
        image: "https://arweave.net/300Gj5yhBGufkHA5oZaHSDWOzeGyQmODoUIoSfiTrQ4",
        //image: await toMetaplexFileFromBrowser(event.target.files[0]), 
    });
    console.log('完成上傳metadata，接著創建collection nft');
    const { nft: collectionNft } = await metaplex.nfts().create({
        name: '測試NFT',
        uri: uri,
        sellerFeeBasisPoints: 0,
        isCollection: true,
        updateAuthority:collectionAuthority,//此行為這個collection nft權限的所有者  
    });
    console.log('設定糖果機');
    const candyMachineSettings = {
        sellerFeeBasisPoints: 100,//1%
        symbol: "MYPROJECT",
        maxEditionSupply: toBigNumber(500),
        isMutable: true,
        itemsAvailable: toBigNumber(500),
        creators: [
            { address:meeeAuthority, share: 100 },
        ],
        itemSettings: {
            type: "configLines",
            prefixName: "My NFT Project #$ID+1$",
            nameLength: 10,
            prefixUri: "https://arweave.net/",
            uriLength: 100,
            isSequential: false,
        },
        collection: {
            address: collectionNft.address,
            updateAuthority:collectionAuthority
        },
        guards: {
            botTax: { lamports: sol(0.00), lastInstruction: false },
            solPayment: { amount: sol(0.00), destination: meeeAuthority },
            startDate: { date: toDateTime("2023-1-17T16:00:00Z") },
            // All other guards are disabled...
        },
        };
    console.log('完成創建collection nft和糖果機設定');
    console.log('創建糖果機，放入糖果機設定和collection nft');
    const { candyMachine } = await metaplex.candyMachines().create({
          ...candyMachineSettings,
        });
        console.log('將資料插入糖果機');
    await metaplex.candyMachines().insertItems({
        candyMachine,// 將項目插入糖果機
        items: [
            { name: "Kenny NFT", uri: uri },//metadata
            //{ name: "My NFT #2", uri: "https://example.com/nft2.json" },
        ],
        });
    console.log('完成創建糖果機')
    console.log('collection授權人:',collectionAuthority.publicKey.toString())
    console.log('糖果機地址:',candyMachine.address.toString())
    console.log('collection nft地址:',collectionNft.address.toString())
  };

  if (!wallet.connected) {
    return null;
  }else {
    checkEligibility();
  }

  return (
    <div>
      <div>
        <div className={styles.container}>
          <div className={styles.nftForm}>
            <button onClick={onClick}>Create candy machine</button>
          </div>
        </div>
      </div>
    </div>
  );
};
