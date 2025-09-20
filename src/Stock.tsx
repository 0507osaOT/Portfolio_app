import React from 'react';

interface StockProps {
  onBack: () => void;
  products: Product[];
}

interface Product {
  id: number;
  name: string;
  stock: number;
  shortage: number;
}

const Stock: React.FC<StockProps> = ({ onBack, products }) => {
  return (
    <div style={{ width: '100%' }}>
      <button
        onClick={onBack}
        style={{
          padding: '12px 24px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}
      >
        ← ホームに戻る
      </button>
      
      {/* ストックの内容 */}
      <div style={{
        width: '100%',
        backgroundColor: '#fff',
        padding: '39px',
        borderRadius: '20px',
        boxShadow: '0 5px 16px rgba(0, 0, 0, 0.1)',
        boxSizing: 'border-box'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '23px'
        }}>
          <thead>
            <tr>
              <th style={{
                padding: '26px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '31px',
                color: '#333',
                backgroundColor: '#f8f9fa'
              }}>購入品</th>
              <th style={{
                padding: '26px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '31px',
                color: '#333',
                backgroundColor: '#f8f9fa'
              }}>在庫</th>
              <th style={{
                padding: '26px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '31px',
                color: '#dc3545',
                backgroundColor: '#f8f9fa'
              }}>欠品</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td style={{
                  padding: '33px 26px',
                  textAlign: 'center',
                  backgroundColor: '#ffffff'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {[...Array(6)].map((_, index) => (
                      <div key={index} style={{
                        width: '42px',
                        height: '42px',
                        border: '4px solid #333',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff'
                      }}></div>
                    ))}
                  </div>
                </td>
                <td style={{
                  padding: '33px 26px',
                  textAlign: 'center',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#333',
                  backgroundColor: '#ffffff'
                }}>{product.stock}</td>
                <td style={{
                  padding: '33px 26px',
                  textAlign: 'center',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#dc3545',
                  backgroundColor: '#ffffff'
                }}>{product.shortage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Stock;