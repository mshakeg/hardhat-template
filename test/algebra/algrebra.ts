import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Signers } from "../types";

import type { BasePluginV1Factory } from "../../types/@cryptoalgebra/integral-base-plugin/contracts/BasePluginV1Factory";
import type { BasePluginV1Factory__factory } from "../../types/factories/@cryptoalgebra/integral-base-plugin/contracts/BasePluginV1Factory__factory";

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export async function deployBasePluginV1FactoryFixture(): Promise<{ basePluginV1Factory: BasePluginV1Factory }> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];

  const deployBasePluginV1FactoryFactory: BasePluginV1Factory__factory = <BasePluginV1Factory__factory>await ethers.getContractFactory("BasePluginV1Factory");
  const basePluginV1Factory: BasePluginV1Factory = <BasePluginV1Factory>await deployBasePluginV1FactoryFactory.connect(admin).deploy(ADDRESS_ZERO);
  await basePluginV1Factory.deployed();

  return { basePluginV1Factory };
}


describe("Deploy Algebra", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
  });

  it("should deploy BasePluginV1Factory", async () => {
    const { basePluginV1Factory } = await loadFixture(deployBasePluginV1FactoryFixture);

    console.log(basePluginV1Factory.address);
  })
});

// npx hardhat test test/algebra/algrebra.ts
