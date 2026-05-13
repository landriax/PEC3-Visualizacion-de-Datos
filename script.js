Papa.parse("hotel_bookings.csv", {
  download: true,
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: function(results) {
    const data = results.data;
    buildStory(data);
  },
  error: function(error) {
    showError("No se ha podido cargar el archivo hotel_bookings.csv. Comprueba que está en la misma carpeta que index.html.");
    console.error(error);
  }
});

function buildStory(data) {
  const cleanData = data.filter(d => d.hotel);

  const city = cleanData.filter(d => d.hotel === "City Hotel");
  const resort = cleanData.filter(d => d.hotel === "Resort Hotel");

  const cancelled = cleanData.filter(d => Number(d.is_canceled) === 1).length;

  document.getElementById("totalBookings").textContent = cleanData.length.toLocaleString("es-ES");
  document.getElementById("cityBookings").textContent = city.length.toLocaleString("es-ES");
  document.getElementById("resortBookings").textContent = resort.length.toLocaleString("es-ES");
  document.getElementById("cancelRate").textContent = ((cancelled / cleanData.length) * 100).toFixed(1) + "%";

  createMonthChart(cleanData);
  createCancelChart(city, resort);
  createAdrChart(city, resort);
  createStayChart(city, resort);
}

function createMonthChart(data) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthLabels = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
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
      labels: monthLabels,
      datasets: [
        {
          label: "City Hotel",
          data: cityCounts,
          borderWidth: 3,
          tension: 0.35
        },
        {
          label: "Resort Hotel",
          data: resortCounts,
          borderWidth: 3,
          tension: 0.35
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Reservas por mes según tipo de hotel"
        },
        legend: {
          position: "bottom"
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
        },
        legend: {
          position: "bottom"
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
  const cityAdr = average(
    city.map(d => Number(d.adr)).filter(v => !isNaN(v) && v > 0)
  );

  const resortAdr = average(
    resort.map(d => Number(d.adr)).filter(v => !isNaN(v) && v > 0)
  );

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
        },
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

function createStayChart(city, resort) {
  const cityStay = average(
    city.map(d => Number(d.stays_in_week_nights) + Number(d.stays_in_weekend_nights))
      .filter(v => !isNaN(v) && v > 0)
  );

  const resortStay = average(
    resort.map(d => Number(d.stays_in_week_nights) + Number(d.stays_in_weekend_nights))
      .filter(v => !isNaN(v) && v > 0)
  );

  new Chart(document.getElementById("stayChart"), {
    type: "bar",
    data: {
      labels: ["City Hotel", "Resort Hotel"],
      datasets: [
        {
          label: "Noches medias por reserva",
          data: [cityStay, resortStay],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Duración media de la estancia"
        },
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

function average(values) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function showError(message) {
  const div = document.createElement("div");
  div.className = "loading-error";
  div.textContent = message;
  document.body.prepend(div);
}
