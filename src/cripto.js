
// usa api do oingecko para preços usd

import axios from "axios";

// Mapeamento dos contratos e seus respectivos IDs no CoinGecko
const CONTRACTS = {
  STX: { address: ".stx", id: "blockstack" },
  Welsh: { address: "SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token", id: "welshcorgicoin" },
  Alex: { address: "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex", id: "alex" },
  DIKO: { address: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token", id: "arkadiko" },
  VELAR: { address: "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.velar-token", id: "velar" },
  SAI: { address: "SP3M31QFF6S96215K4Y2Z9K5SGHJN384NV6YM6VM8.satoshai", id: "sai" },
  LEO: { address: "SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token", id: "leo-2" },
  NOT: { address: "SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.nope", id: "nothing-3" },
  ODIN: { address: "SP2X2Z28NXZVJFCJPBR9Q3NBVYBK3GPX8PXA3R83C.odin-tkn", id: "odin-3" },
  Skull: { address: "SP3BRXZ9Y7P5YP28PSR8YJT39RT51ZZBSECTCADGR.skullcoin-stxcity", id: "skullcoin" },
  Wen: { address: "SP25K3XPVBNWXPMYDXBPSZHGC8APW0Z21CWJ3Y3B1.wen-nakamoto-stxcity", id: "wen-token" },
  Wstx: { address: "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx", id: "wrapped-stx" },
  POMBOO: { address: "SP1N4EXSR8DP5GRN2XCWZEW9PR32JHNRYW7MVPNTA.PomerenianBoo-Pomboo", id: "pomboo" },
  Max: { address: "SP7V1SE7EA3ZG3QTWSBA2AAG8SRHEYJ06EBBD1J2.max-token", id: "max-token" },
  SUSDT: { address: "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-susdt", id: "tether" },
  XUSD: { address: "SP2TZK01NKDC89J6TA56SA47SDF7RTHYEQ79AAB9A.Wrapped-USDu", id: "usdx" },
  Roo: { address: "SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo", id: "kangaroo-token" },
  Charima: { address: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token", id: "charima-token" }
};

let cachedPrices = {}; // Cache de preços

// Função para buscar os preços
export async function fetchTokenPrices() {
  try {
    console.log("🔄 Buscando preços...");

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(CONTRACTS).map(contract => contract.id).join(",")}&vs_currencies=usd`
    );

    // Transforma os dados para armazenar com os contratos como chaves
    cachedPrices = Object.entries(CONTRACTS).reduce((acc, [key, { address, id }]) => {
      if (response.data[id] && response.data[id].usd) {
        acc[address] = response.data[id].usd;
      }
      return acc;
    }, {});

    console.log("✅ Preços obtidos:", cachedPrices);
  } catch (error) {
    console.error("❌ Erro ao buscar preços:", error.response?.data || error.message);
  }
}

// Função para obter o valor USD baseado no contrato e quantidade
export function getUsdValue(contractAddress, amount) {
  if (!cachedPrices[contractAddress]) {
    return "Preço não disponível";
  }

  // Ajusta a quantidade (6 casas decimais)
  const adjustedAmount = amount / Math.pow(10, 6);

  return (adjustedAmount * cachedPrices[contractAddress]).toFixed(2) + " USD";
}

export { cachedPrices };
