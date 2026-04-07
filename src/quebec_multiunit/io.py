from typing import List
import pandas as pd

class FileHandler:
    @staticmethod
    def read_csv(file_path: str) -> pd.DataFrame:
        """Reads a CSV file and returns a DataFrame."""
        try:
            return pd.read_csv(file_path)
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return pd.DataFrame()

    @staticmethod
    def write_csv(data: pd.DataFrame, file_path: str) -> None:
        """Writes a DataFrame to a CSV file."""
        try:
            data.to_csv(file_path, index=False)
        except Exception as e:
            print(f"Error writing to {file_path}: {e}")

    @staticmethod
    def read_excel(file_path: str) -> pd.DataFrame:
        """Reads an Excel file and returns a DataFrame."""
        try:
            return pd.read_excel(file_path)
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return pd.DataFrame()

    @staticmethod
    def write_excel(data: pd.DataFrame, file_path: str) -> None:
        """Writes a DataFrame to an Excel file."""
        try:
            data.to_excel(file_path, index=False)
        except Exception as e:
            print(f"Error writing to {file_path}: {e}")