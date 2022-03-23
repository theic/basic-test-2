import { Stat } from './Simulation';

const round = (n: number, d: number = 1): number => {
    const decimals = Math.pow(10, d);
    return Math.round(n * decimals) / decimals;
}

export class WinStatistic implements Stat {

    data = new Map<number, number>();

    log(winAmount: number, hitCount: number): void {

        if (winAmount < 0 || hitCount <= 0) {
            return;
        }

        const winAmountR = round(winAmount);
        const hitCurrent = this.data.get(winAmountR) || 0;

        this.data.set(winAmountR, hitCurrent + hitCount);
    }

    getHitCount(winAmount: number): number {
        if (winAmount < 0) {
            return 0;
        }

        const winAmountR = round(winAmount);

        return this.data.get(winAmountR) || 0;
    }

    merge(anotherStat: WinStatistic): void {
        anotherStat.data.forEach((hit, win) => {
            const hitAnother = this.getHitCount(win);
            this.data.set(win, hitAnother + hit);
        });
    }

    print(): void {

        const sorted = [...this.data.entries()].sort();

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

        const winAvg = round(winSum / hitsSum, 3);
        
        result = `The smallest non-zero win is ${winSmallest}, the biggest is ${winBiggest}.\n` + result;
        result = `The average win amount: ${winAvg}.\n` + result;
        result = `Total win amount: ${round(winSum, 3)}.\n` + result;

        console.log(result);
    }
}