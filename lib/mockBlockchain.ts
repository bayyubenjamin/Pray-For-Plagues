// Abstract interface for future real contract implementation
export interface IPlaguesContract {
  upgradeAntidote(id: number): Promise<boolean>;
  getAntidoteData(id: number): Promise<any>;
}

// Mock implementation
export const mockUpgradeTransaction = async (id: number): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 2500); // 2.5s simulated delay
  });
};
