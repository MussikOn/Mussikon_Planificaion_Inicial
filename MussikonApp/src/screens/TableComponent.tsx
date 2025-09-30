import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface TableProps {
  headers: string[];
  data: any[][];
  onRowPress?: (rowData: any[], rowIndex: number) => void;
  renderCell?: (cellData: any, rowIndex: number, colIndex: number) => React.ReactNode;
}

const TableComponent: React.FC<TableProps> = ({ headers, data, onRowPress, renderCell }) => {
  return (
    <ScrollView horizontal>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          {headers.map((header, index) => (
            <Text key={index} style={styles.headerCell}>{header}</Text>
          ))}
        </View>
        {data.map((row, rowIndex) => (
          <TouchableOpacity
            key={rowIndex}
            style={styles.dataRow}
            onPress={() => onRowPress && onRowPress(row, rowIndex)}
            disabled={!onRowPress}
          >
            {row.map((cell, colIndex) => (
              <View key={colIndex} style={styles.dataCell}>
                {renderCell ? renderCell(cell, rowIndex, colIndex) : <Text>{cell}</Text>}
              </View>
            ))}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerCell: {
    padding: 10,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  dataCell: {
    padding: 10,
    flex: 1,
    textAlign: 'center',
  },
});

export default TableComponent;