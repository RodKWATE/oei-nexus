# CLI for Quebec Multi-Unit Analyzer

import argparse
from quebec_multiunit.core import analyze_properties
from quebec_multiunit.reports import generate_report

def main():
    parser = argparse.ArgumentParser(description='Analyze multi-unit residential properties in Quebec.')
    parser.add_argument('input_file', type=str, help='Path to the input CSV file containing property data.')
    parser.add_argument('--output', type=str, default='report.txt', help='Path to the output report file.')
    
    args = parser.parse_args()
    
    # Analyze properties
    analysis_results = analyze_properties(args.input_file)
    
    # Generate report
    generate_report(analysis_results, args.output)
    
    print(f'Report generated: {args.output}')

if __name__ == '__main__':
    main()