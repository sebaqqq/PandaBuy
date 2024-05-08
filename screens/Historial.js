import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { db } from "../dataBase/Firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";

const Historial = () => {
  const navigation = useNavigation();
  const [historialCompleto, setHistorialCompleto] = useState([]);
  const [historialFiltrado, setHistorialFiltrado] = useState([]);
  const [totalPorFecha, setTotalPorFecha] = useState({});
  const [totalPorMes, setTotalPorMes] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const historialCollection = collection(db, "historialVentas");
        const historialSnapshot = await getDocs(historialCollection);
        const historialData = historialSnapshot.docs.map((doc) => {
          const data = doc.data();
          const totalCompra = parseFloat(data.totalCompra);
          return {
            id: doc.id,
            ...data,
            totalCompra: isNaN(totalCompra) ? 0 : totalCompra,
          };
        });
        setHistorialCompleto(historialData);
        calcularTotalPorFecha(historialData);
        calcularTotalPorMes(historialData);
      } catch (error) {
        console.error("Error fetching historial:", error);
      }
    };
    fetchHistorial();
  }, [refreshing]);

  useEffect(() => {
    calcularTotalPorFecha(historialFiltrado);
  }, [historialFiltrado]);
  
  

  const calcularTotalPorFecha = (historialData) => {
    const totalPorFecha = {};
    historialData.forEach((item) => {
      const fecha = formatFecha(item.fecha);
      if (fecha === formatFecha(selectedDate)) {
        const totalCompra = parseFloat(item.totalCompra);
        totalPorFecha[fecha] = (totalPorFecha[fecha] || 0) + totalCompra;
      }
    });
    setTotalPorFecha(totalPorFecha);
  };

  const calcularTotalPorMes = (historialData) => {
    const totalPorMes = {};
    historialData.forEach((item) => {
      const fecha = new Date(item.fecha);
      const yearMonth = fecha.getFullYear() + "-" + (fecha.getMonth() + 1);
      if (!totalPorMes[yearMonth]) {
        totalPorMes[yearMonth] = 0;
      }
      totalPorMes[yearMonth] += parseFloat(item.totalCompra);
    });
    setTotalPorMes(totalPorMes);
  };

  const filtrarHistorialPorFecha = (fecha) => {
    const fechaSeleccionada = new Date(fecha);
    const filteredHistorial = historialCompleto.filter((item) => {
      const fechaItem = new Date(item.fecha);
      return (
        fechaSeleccionada.getDate() === fechaItem.getDate() &&
        fechaSeleccionada.getMonth() === fechaItem.getMonth() &&
        fechaSeleccionada.getFullYear() === fechaItem.getFullYear()
      );
    });
    setHistorialFiltrado(filteredHistorial);
    calcularTotalPorFecha(filteredHistorial);
  };
  
  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString); // Usa date.dateString directamente
  };
  
  const formatFecha = (fecha) => {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistorial().then(() => {
      setRefreshing(false); 
    });
  };
  
  const fetchHistorial = async () => {
    try {
      const historialCollection = collection(db, "historialVentas");
      const historialSnapshot = await getDocs(historialCollection);
      const historialData = historialSnapshot.docs.map((doc) => {
        const data = doc.data();
        const totalCompra = parseFloat(data.totalCompra);
        return {
          id: doc.id,
          ...data,
          totalCompra: isNaN(totalCompra) ? 0 : totalCompra,
        };
      });
      setHistorialCompleto(historialData);
      calcularTotalPorFecha(historialData);
      calcularTotalPorMes(historialData);
    } catch (error) {
      console.error("Error fetching historial:", error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("DetallesCarrito", { carritoId: item.id });
      }}
    >
      <View style={styles.itemContainer}>
        <Text>Vendedor: {item.usuario?.firstName}</Text>
        <Text>Fecha Compra: {formatFecha(item.fecha)}</Text>
        <Text>Total Compra: {item.totalCompra}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
<Calendar
  onDayPress={(date) => {
    handleDateSelect(date);
    filtrarHistorialPorFecha(date.dateString);
  }}
  markedDates={{
    [selectedDate]: { selected: true, selectedColor: "blue" },
  }}
  style={{ width: "100%" }}
/>

      <FlatList
        data={historialFiltrado}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total por Día:</Text>
        {Object.keys(totalPorFecha).map((fecha) => (
          <Text key={fecha}>
            {fecha}: {totalPorFecha[fecha]}
          </Text>
        ))}
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total por Mes:</Text>
        {Object.keys(totalPorMes).map((yearMonth) => (
          <Text key={yearMonth}>
            {yearMonth}: {totalPorMes[yearMonth]}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContainer: {
    width: 350,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  boton: {
    backgroundColor: "#1C2120",
    padding: 10,
    borderRadius: 8,
    width: "70%",
    alignItems: "center",
  },
  botonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  totalContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  totalText: {
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default Historial;
