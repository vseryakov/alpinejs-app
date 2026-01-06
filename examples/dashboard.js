
import { $, AlpineComponent } from "../dist/app.mjs"

export class dashboard extends AlpineComponent {

    tab = "charts"

    charts = [
        {
            type: "line",
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [{
                    label: 'Sales Over Time',
                    data: [120, 190, 300, 500, 200, 300, 250],
                    backgroundColor: 'rgba(74, 144, 226, 0.2)',
                    borderColor: 'rgba(74, 144, 226, 1)',
                    borderWidth: 2,
                    tension: 0.4
                }]
            },
        },

        {
            type: "bar",
            data: {
                labels: ['Chrome', 'Firefox', 'Safari', 'Edge'],
                datasets: [{
                    label: 'Browser Usage',
                    data: [65, 59, 80, 81],
                    backgroundColor: [
                        'rgba(74, 144, 226, 0.8)',
                        'rgba(80, 227, 194, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(255, 99, 132, 0.8)',
                    ],
                    borderColor: [
                        'rgba(74, 144, 226, 1)',
                        'rgba(80, 227, 194, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(255, 99, 132, 1)',
                    ],
                    borderWidth: 1
                }]
            }
        }
    ]
};


export class chart extends AlpineComponent {

    chart;

    onCreate()
    {
        const ctx = $("canvas", this.$el).getContext('2d');
        this.chart = new Chart(ctx, {
            type: this.type,
            data: this.data,
            options: {
                responsive: true,
                animation: {
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        grid: {
                            color: '#eaeaea'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    onDelete()
    {
        if (this.chart) this.chart.destroy();
    }
}

