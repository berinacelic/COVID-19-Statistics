export class LineChartData {
    private date: string;
    private new_cases: number;
    private total_tests: number;

    constructor(date: string, new_cases: number, total_tests: number) {
        this.date = date;
        this.new_cases = new_cases;
        this.total_tests = total_tests;
    }
}
