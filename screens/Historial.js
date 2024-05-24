import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { db } from "../dataBase/Firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { MaterialCommunityIcons } from "@expo/vector-icons";

LocaleConfig.locales["es"] = {
  monthNames: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  monthNamesShort: [
    "Ene.",
    "Feb.",
    "Mar.",
    "Abr.",
    "May.",
    "Jun.",
    "Jul.",
    "Ago.",
    "Sept.",
    "Oct.",
    "Nov.",
    "Dic.",
  ],
  dayNames: [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ],
  dayNamesShort: ["Dom.", "Lun.", "Mar.", "Mié.", "Jue.", "Vie.", "Sáb."],
  today: "Hoy",
};
LocaleConfig.defaultLocale = "es";

const Historial = () => {
  const navigation = useNavigation();
  const [historialCompleto, setHistorialCompleto] = useState([]);
  const [historialFiltrado, setHistorialFiltrado] = useState([]);
  const [totalPorFecha, setTotalPorFecha] = useState({});
  const [totalPorMes, setTotalPorMes] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <MaterialCommunityIcons
          name="update"
          size={26}
          color="#1C2120"
          onPress={handleRefresh}
          style={{ marginRight: 20 }}
        />
      ),
    });
  }, [navigation]);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await fetchHistorial();
    } catch (error) {
      console.error("Error al refrescar el historial:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  useEffect(() => {
    calcularTotalPorFecha(historialFiltrado);
  }, [historialFiltrado]);

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

  const calcularTotalPorFecha = (historialData) => {
    const totalPorFecha = {};
    historialData.forEach((item) => {
      const fecha = formatFecha(item.fecha);
      const totalCompra = parseFloat(item.totalCompra);
      totalPorFecha[fecha] = (totalPorFecha[fecha] || 0) + totalCompra;
    });
    setTotalPorFecha(totalPorFecha);
  };

  const calcularTotalPorMes = (historialData) => {
    const totalPorMes = {};
    historialData.forEach((item) => {
      const [day, month, year] = item.fecha.split("/");
      const yearMonth = `${year}-${month}`;
      if (!totalPorMes[yearMonth]) {
        totalPorMes[yearMonth] = 0;
      }
      totalPorMes[yearMonth] += parseFloat(item.totalCompra);
    });
    setTotalPorMes(totalPorMes);
  };

  const filtrarHistorialPorFecha = (fecha) => {
    const [year, month, day] = fecha.split("-");
    const formattedFecha = `${day}/${month}/${year.slice(2)}`;
    const filteredHistorial = historialCompleto.filter((item) => {
      return item.fecha === formattedFecha;
    });
    setHistorialFiltrado(filteredHistorial);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
    filtrarHistorialPorFecha(date.dateString);
  };

  const formatFecha = (fecha) => {
    const [day, month, year] = fecha.split("/");
    return `${day}/${month}/${year}`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistorial().then(() => {
      setRefreshing(false);
    });
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
        }}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: "#1C2120" },
        }}
        style={styles.calendario}
        locale={"es"}
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
            {yearMonth} : {totalPorMes[yearMonth]}
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
  calendario: {
    width: Dimensions.get("window").width,
    marginBottom: 12,
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
