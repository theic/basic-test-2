import {Simulation} from './Simulation';
import { WinStatistic } from './WinStatistic';

Simulation.runSimulation(() => {
    return new WinStatistic();
});
