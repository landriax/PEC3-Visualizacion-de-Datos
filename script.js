// Añadir en CodePen estos scripts externos:
// https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js
// https://cdn.jsdelivr.net/npm/chart.js

const fileInput = document.getElementById("csvFile");

fileInput.addEventListener("change", function(event) {
  const file = event.target.files[0];

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function(results) {
      const data = results.data;
      buildStory(data);
    }
  });
});

function buildStory(data) {
  document.querySelectorAll(".hidden").forEach(el => {
    el.style.display = "block";
  });

  const city = data.filter(d => d.hotel === "City Hotel");
  const resort = data.filter(d => d.hotel === "Resort Hotel");

  document.getElementById("totalBookings").textContent = data.length.toLocaleString();
  document.getElementById("cityBookings").textContent = city.length.toLocaleString();
  document.getElementById("resortBookings").textContent = resort.length.toLocaleString();

  const cancelled = data.filter(d => Number(d.is_canceled) === 1).length;
  document.getElementById("cancelRate").textContent = ((cancelled / data.length) * 100).toFixed(1) + "%";

  createMonthChart(data);
  createCancelChart(city, resort);
  createAdrChart(city, resort);
}

function createMonthChart(data) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const cityCounts = months.map(month =>
    data.filter(d => d.hotel === "City Hotel" && d.arrival_date_month === month).length
  );

  const resortCounts = months.map(month =>
    data.filter(d => d.hotel === "Resort Hotel" && d.arrival_date_month === month).length
  );

  new Chart(document.getElementById("monthChart"), {
    type: "line",
    data: {
      labels: months,
      datasets: [
        {
          label: "City Hotel",
          data: cityCounts,
          borderWidth: 3,
          tension: 0.3
        },
        {
          label: "Resort Hotel",
          data: resortCounts,
          borderWidth: 3,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Reservas por mes según tipo de hotel"
        }
      }
    }
  });
}

function createCancelChart(city, resort) {
  const cityCancel = city.filter(d => Number(d.is_canceled) === 1).length;
  const cityNoCancel = city.length - cityCancel;

  const resortCancel = resort.filter(d => Number(d.is_canceled) === 1).length;
  const resortNoCancel = resort.length - resortCancel;

  new Chart(document.getElementById("cancelChart"), {
    type: "bar",
    data: {
      labels: ["City Hotel", "Resort Hotel"],
      datasets: [
        {
          label: "No canceladas",
          data: [cityNoCancel, resortNoCancel]
        },
        {
          label: "Canceladas",
          data: [cityCancel, resortCancel]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Reservas canceladas y no canceladas"
        }
      },
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true
        }
      }
    }
  });
}

function createAdrChart(city, resort) {
  const cityAdr = average(city.map(d => Number(d.adr)).filter(v => !isNaN(v) && v > 0));
  const resortAdr = average(resort.map(d => Number(d.adr)).filter(v => !isNaN(v) && v > 0));

  new Chart(document.getElementById("adrChart"), {
    type: "bar",
    data: {
      labels: ["City Hotel", "Resort Hotel"],
      datasets: [
        {
          label: "ADR medio",
          data: [cityAdr, resortAdr],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Precio medio diario ADR por tipo de hotel"
        }
      }
    }
  });
}

function average(values) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}