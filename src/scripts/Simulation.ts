interface LoggableStat {
    log(winAmount: number, hitCount: number): void;
}

interface MergeableStat {
    merge(anotherStat: MergeableStat): void;
}

interface TestableStat {
    getHitCount(winAmount: number): number;
}

export interface Stat extends LoggableStat, MergeableStat, TestableStat {
    print(): void;
}

export type CreateStatFn = () => Stat;
export class Simulation {
    private static readonly logIterationCount = 50000;
    private static readonly statsToTestCount = 10;
    static runSimulation(createStatFn: CreateStatFn): number {
        if (createStatFn == null)
            throw Error('create new stat function not specified');
        const startTime = Date.now();
        const resStat = Simulation.runSingleSim(createStatFn);
        resStat.print();
        const durationMs = Date.now() - startTime;
        console.log(`Simulation took ${durationMs}ms.`);
        return durationMs;
    }
    private static runSingleSim(createStatFn: CreateStatFn): Stat {
        // 1/4. Create statistics.
        const stats = [];
        for (let i = 0; i < Simulation.statsToTestCount; i++) {
            stats.push(createStatFn());
        }
        // 2/4. Fill.
        for (const stat of stats) {
            Simulation.fillStat(stat);
        }
        // 3/4. Merge all together.
        const resStat = Simulation.mergeStats(createStatFn, stats);
        // 4/4. Test.
        Simulation.testFinalStatWins(resStat);
        return resStat;
    }

    private static fillStat(stat: LoggableStat): void {
        for (let i = 0; i < Simulation.logIterationCount; i++) {
            if (Math.random() < 0.5) {
                // 50% chance of no win.
                stat.log(0, 1);
                continue;
            }
            const rndWinAmount =
                Math.random() + Math.floor(Math.random() * 3) + 1; // [1,3.9999999999999999]-> [1, 4] after rounding.
            const rndHitCount = Math.floor(Math.random() * 2) + 1; // [1,2]
            stat.log(rndWinAmount, rndHitCount);
        }
    }

    private static mergeStats(
        createStatFn: CreateStatFn,
        stats: MergeableStat[]
    ): Stat {
        const resStat = createStatFn();
        for (const stat of stats) {
            resStat.merge(stat);
        }
        return resStat;
    }

    private static testFinalStatWins(stat: TestableStat): void {
        const expectedZerosHitCount =
            (Simulation.logIterationCount / 2) * // 50% of getting zero in each test.
            Simulation.statsToTestCount;
        Simulation.testSingleWin(stat, 0, expectedZerosHitCount);
        const winAmountSmallestIncl = 1;
        const smallestWinAmountStep = 0.1;
        const winAmountBiggestIncl = 4;
        // Test all values in the middle.
        const expectedMiddleHitCount = expectedZerosHitCount / 2 / 10;
        for (
            let winAmount = winAmountSmallestIncl + smallestWinAmountStep;
            winAmount < winAmountBiggestIncl;
            winAmount += smallestWinAmountStep
        ) {
            Simulation.testSingleWin(
                stat,
                winAmount,
                expectedMiddleHitCount
            );
        }
        // Test lower and upper range.
        const expectedEdgesZerosHitCount = expectedMiddleHitCount / 2;
        Simulation.testSingleWin(
            stat,
            winAmountSmallestIncl,
            expectedEdgesZerosHitCount
        );
        Simulation.testSingleWin(
            stat,
            winAmountBiggestIncl,
            expectedEdgesZerosHitCount
        );
        // Test out of the range.
        Simulation.testSingleWin(
            stat,
            winAmountSmallestIncl - smallestWinAmountStep,
            0
        );
        Simulation.testSingleWin(
            stat,
            winAmountBiggestIncl + smallestWinAmountStep,
            0
        );
    }

    private static testSingleWin(
        stat: TestableStat,
        testableWinAmount: number,
        expectedHitsCount: number
    ): void {
        const discrepancy = 0.1;
        const currWinHitCount = stat.getHitCount(testableWinAmount);
        if (
            !Simulation.checkIsValueInRange(
                currWinHitCount,
                expectedHitsCount,
                discrepancy
            )
        ) {
            throw new Error(
                `Statistics contains incorrect data: there are ${currWinHitCount} hits of
                "${testableWinAmount}" but expected ${expectedHitsCount} +/-${discrepancy * 100}% hits.`
            );
        }
    }

    private static checkIsValueInRange(
        currentValue: number,
        referenceValue: number,
        discrepancy: number
    ): boolean {
        return (
            currentValue === referenceValue ||
            (currentValue > referenceValue * (1 - discrepancy) &&
                referenceValue * (1 + discrepancy) > currentValue)
        );
    }
}