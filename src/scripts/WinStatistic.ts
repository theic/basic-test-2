import { Stat } from './Simulation';

const round = (n: number) => Math.round(n * 10) / 10;
const data = new Map<number, number>();

export class WinStatistic implements Stat {

    log(winAmount: number, hitCount: number): void {

        if (winAmount < 0 || hitCount <= 0) {
            return;
        }

        const winAmountR = round(winAmount);
        const hitCurrent = data.get(winAmountR) || 0;

        data.set(winAmountR, hitCurrent + hitCount);
    }

    getHitCount(winAmount: number): number {
        if (winAmount < 0) {
            return 0;
        }

        const winAmountR = round(winAmount);

        return data.get(winAmountR) || 0;
    }

    merge(anotherStat: WinStatistic): void {
        for (const [win, hit] of Object.entries(data.keys())) {
            const hitAnother = anotherStat.getHitCount(+win) || 0;
            data.set(+win, hitAnother + hit);
        }
    }

    print(): void {

        const sorted = [...data.entries()].sort();

        let winSum = 0;
        let winSmallest = 0;
        let winBiggest = 0;
        let ind = 1;
        let hitsSum = 0;
        let result = `All unique wins (sorted 0…9):\n`;

        for (const s of sorted) {
            const win = s[0];
            const hit = s[1];

            if ((win > 0 && win < winSmallest) || winSmallest === 0) {
                winSmallest = win;
            }

            if (win > winBiggest) {
                winBiggest = win;
            }

            winSum += win * hit;
            hitsSum += hit;
            result += `${ind++}. ${s[0]}: ${s[1]}\n`;
        }

        const winAvg = round(winSum / hitsSum);
        
        result = `The smallest non-zero win is ${winSmallest}, the biggest is ${winBiggest}.\n` + result;
        result = `The average win amount: ${winAvg}.\n` + result;
        result = `Total win amount: ${round(winSum)}.\n` + result;

        console.log(result);
    }
}