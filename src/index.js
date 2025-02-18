const { Connection, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction} = require('@solana/web3.js');
const { 
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
  createAssociatedTokenAccount, 
  mintTo,
} = require("@solana/spl-token");

const axios = require('axios');
const crypto = require('crypto');

// Define LAMPORTS_PER_SOL
const LAMPORTS_PER_SOL = 1_000_000_000;
// Solana连接配置
// 初始化连接和支付账户
const connection = new Connection("https://api.devnet.solana.com", {
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 60000, // 60 seconds
});


const privateKey = Uint8Array.from([28,14,109,191,46,23,230,168,6,224,182,9,118,196,240,190,61,73,147,173,66,244,244,118,49,19,244,195,129,59,96,213,49,235,100,179,120,210,69,201,45,7,4,148,69,234,93,249,163,37,164,81,212,151,27,229,217,12,99,245,20,168,102,177]);
const payer = Keypair.fromSecretKey(privateKey);
console.log('address:', payer.publicKey.toBase58());


// 登录函数
async function login() {
  const loginUrl = 'https://api.valueclouds.com/ppr/web/login/login';
  const loginPayload = {
    account: '13281881130',
    password: '1ff90cc945ee04d9be0d0a14ec2ded658e0efffb',
    project: 'IOT',
  };

  try {
    const response = await axios.post(loginUrl, loginPayload);

    // 获取响应数据中的 token, secret, userId
    if (response.data && response.data.data) {
      const { token, secret, userId } = response.data.data;

      // 从响应头获取 Auth
      const auth = response.headers['auth']; // 注意小写，axios 会将 header 转为小写
      return { token, secret, userId, auth };
    } else {
      throw new Error('登录失败，未返回 data 字段');
    }
  } catch (error) {
    console.error('登录失败:', error.message);
    throw error;
  }
}

// 生成签名
function generateSign(secret, path) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(path);
    return hmac.digest('hex');
}

async function getSolarEnergyData({ token, secret, userId, auth }) {
    const path = '/dcs/api/auth/web/solar/plants/energyDay';
    const sign = generateSign(secret, path);
    console.log('Generated sign:', sign);


    const energyDataUrl = `https://api.valueclouds.com${path}`;
    const params = { date: '2025-02-12' }; // Use params for GET request

    try {
      const response = await axios.get(energyDataUrl, {
        headers: {
          project: 'IOT',
          token: token,
          sign: sign,
          secret: secret,
          i18n: 'zh_CN',
          userId: userId,
          auth: auth, // 加入 auth 到 header
        },
        params: params, // Add params to the request
      });

      if (response.data.success) {
        const { energyDay } = response.data.data;
        console.log('Energy Data:', energyDay);
        return energyDay
      } else {
        console.error('获取发电量数据失败:', response.data.errorMessage || '未知错误');
        return null; // Return null if there's an error
      } 
    } catch (error) {
      console.error('获取发电量数据失败:', error.message);
      throw error;
    }
  }

  // 创建代币
  async function createToken() {
    // 确保连接和公钥有效
    if (!connection || !payer.publicKey) {
      console.error('连接或公钥无效');
      return;
    }
  
    // 获取最低租金余额
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
  
    // 创建新的密钥对用于 mint
  const mintKeypair = Keypair.generate();

    // 创建交易对象
    const transaction = new Transaction();
  
    // 添加创建账户和初始化 mint 的指令
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey, // 从哪个公钥创建账户
        newAccountPubkey: mintKeypair.publicKey, // 新 mint 的公钥
        space: MINT_SIZE, // 空间大小（确保 MINT_SIZE 是正确的）
        lamports, // 所需的 SOL 租金
        programId: TOKEN_PROGRAM_ID, // 代币程序 ID
      }),
      createInitializeMintInstruction(
        mintKeypair.publicKey, // mint 的公钥
        0, // 小数位数
        payer.publicKey, // 铸币权限
        payer.publicKey, // 冻结权限
        TOKEN_PROGRAM_ID // 代币程序 ID
      )
    );

    // 发送交易
    try {
      const signature =  await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair]); // 将 connection 作为第一个参数传递
      console.log('交易哈希:', signature);
      return mintKeypair.publicKey;
    } catch (error) {
      console.error('发送交易时出错:', error.message);
      
    }
  }
  

// 铸造代币
async function mintToken(mint, amount, destination) {
  try {
  if (!payer || !mint || !destination) {
    throw new Error('Mint或目标地址无效');
  }

  // 创建关联代币账户（如果不存在）
  const destinationAccount = await createAssociatedTokenAccount(
    connection,
    payer, // 支付账户
    mint, // 代币 Mint 地址
    destination // 目标钱包地址
  );

  // 铸造代币
  await mintTo(
    connection,
    payer, // 支付账户和签名者
    mint, // 代币 Mint 地址
    destinationAccount, // 目标账户
    payer, // 铸造权限账户（需签名）
    amount * 10 ** 9, // 转换为代币的小数单位
    [] // 可选的多签
  );
  console.log(`${amount} tokens minted to ${destinationAccount.toBase58()}`);
} catch (error) {
  console.error('Error minting token:', error.message);
  throw error;
}
}


  async function main() {


    try {
       // 调用登录函数
    const { token, secret, userId, auth } = await login();
    console.log('登录成功，获取到 token:', token, 'secret:', secret, 'userId:', userId, 'Auth:', auth);
    const energyDayKWh = await getSolarEnergyData({ token, secret, userId, auth });
    if (energyDayKWh === null) {
      throw new Error('获取发电量数据失败');
    }
    console.log('获取发电量数据成功:', energyDayKWh);

    if (energyDayKWh <= 0) {
      throw new Error('Invalid energy data');
    }

    const mint = await createToken();
      const destination = payer.publicKey; // 铸造到自己的钱包
      await mintToken(mint, energyDayKWh, destination);  // 根据发电量铸造代币
      

    } catch (error) {
      console.error('调用 getSolarEnergyData 时发生错误:', error);
    }
  }


  main();

  



