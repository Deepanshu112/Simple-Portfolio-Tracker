import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
    const [portfolios, setPortfolios] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        symbol: "",
        quantity: "",
        purchasePrice: "",
        currentPrice: "",
    });
    const [loading, setLoading] = useState(true);
    const [editingPortfolio, setEditingPortfolio] = useState(null);
    const [showProfit, setShowProfit] = useState(false);
    const [showLoss, setShowLoss] = useState(false);
    const [editingStock, setEditingStock] = useState(null);

    useEffect(() => {
        fetchPortfolios();
    }, []);

    useEffect(() => {
        if (editingPortfolio) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [editingPortfolio]);

    const fetchPortfolios = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/portfolios");
            setPortfolios(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching portfolios:", error);
        }
    };

    const calculateCurrentValue = (portfolio) => {
        let currentValue = 0;
        for (const stock of portfolio.stocks) {
            currentValue += stock.quantity * stock.currentPrice;
        }
        return currentValue;
    };

    const calculateInvestedAmount = (portfolio) => {
        let investedAmount = 0;
        for (const stock of portfolio.stocks) {
            investedAmount += stock.quantity * stock.purchasePrice;
        }
        return investedAmount;
    };

    const handleAddPortfolio = async () => {
        try {
            const newStock = { ...formData };
            const response = await axios.post(
                "http://localhost:3000/api/portfolios",
                { name: formData.name, stocks: [newStock] }
            );
            setPortfolios([...portfolios, response.data]);
            setFormData({
                name: "",
                symbol: "",
                quantity: "",
                purchasePrice: "",
                currentPrice: "",
            });
        } catch (error) {
            console.error("Error adding portfolio:", error);
        }
    };

    const deletePortfolio = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/api/portfolios/${id}`);
            setPortfolios(portfolios.filter((portfolio) => portfolio._id !== id));
        } catch (error) {
            console.error("Error deleting portfolio:", error);
        }
    };

    const handleSubmitEdit = async () => {
        try {
            const response = await axios.put(
                `http://localhost:3000/api/portfolios/${editingPortfolio._id}`,
                formData
            );
            const updatedPortfolios = portfolios.map((portfolio) =>
                portfolio._id === response.data._id ? response.data : portfolio
            );
            setPortfolios(updatedPortfolios);
            setEditingPortfolio(null);
            setFormData({
                name: "",
                symbol: "",
                quantity: "",
                purchasePrice: "",
                currentPrice: "",
            });
        } catch (error) {
            console.error("Error editing portfolio:", error);
        }
    };

    const handleEditPortfolio = (portfolio) => {
        setEditingPortfolio(portfolio);
        setFormData({
            name: portfolio.name,
            symbol: portfolio.symbol,
            quantity: portfolio.quantity,
            purchasePrice: portfolio.purchasePrice,
            currentPrice: portfolio.currentPrice,
        });
    };

    const calculateProfitLossPercentage = (portfolio) => {
        const currentValue = calculateCurrentValue(portfolio);
        const investedAmount = calculateInvestedAmount(portfolio);
        const profitLoss = currentValue - investedAmount;
        return ((profitLoss / investedAmount) * 100).toFixed(2);
    };

    const getProfitLossClass = (portfolio) => {
        const currentValue = calculateCurrentValue(portfolio);
        const investedAmount = calculateInvestedAmount(portfolio);
        const profitLoss = currentValue - investedAmount;
        return profitLoss >= 0 ? "profit" : "loss";
    };

    const handleShowProfit = () => {
        setShowProfit(true);
        setShowLoss(false);
    };

    const handleShowLoss = () => {
        setShowProfit(false);
        setShowLoss(true);
    };

    const handleEditStock = (portfolioId, stockId) => {
        setEditingPortfolio(portfolioId);
        setEditingStock(stockId); 
    };

    const handleSaveEditedStock = async (portfolioId, stockId, updatedStock) => {
        try {
            const response = await axios.put(
                `http://localhost:3000/api/portfolios/${portfolioId}/stocks/${stockId}`,
                updatedStock
            );
            const updatedPortfolios = portfolios.map((portfolio) => {
                if (portfolio._id === portfolioId) {
                    const updatedStocks = portfolio.stocks.map((stock) => {
                        return stock._id === stockId ? response.data : stock;
                    });
                    return { ...portfolio, stocks: updatedStocks };
                }
                return portfolio;
            });
            setPortfolios(updatedPortfolios);
            setEditingPortfolio(null);
            setEditingStock(null); 
        } catch (error) {
            console.error("Error updating stock:", error);
        }
    };

    const handleDeleteStock = async (portfolioId, stockId) => {
        try {
            await axios.delete(
                `http://localhost:3000/api/portfolios/${portfolioId}/stocks/${stockId}`
            );
            const updatedPortfolios = portfolios.map((portfolio) => {
                if (portfolio._id === portfolioId) {
                    const updatedStocks = portfolio.stocks.filter(
                        (stock) => stock._id !== stockId
                    );
                    return { ...portfolio, stocks: updatedStocks };
                }
                return portfolio;
            });
            setPortfolios(updatedPortfolios);
        } catch (error) {
            console.error("Error deleting stock:", error);
        }
    };

    return (
        <div className="container">
            <h1 className="title">Stock Portfolio Tracker</h1>

            <div className="add-edit-form">
                <h2 className="sub-title">
                    {editingPortfolio ? "Edit Portfolio" : "Add New Portfolio"}
                </h2>
                <div className="input-container">
                    <label htmlFor="name" className="input-label">
                        Name:
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field"
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="symbol" className="input-label">
                        Symbol:
                    </label>
                    <input
                        type="text"
                        id="symbol"
                        value={formData.symbol}
                        onChange={(e) =>
                            setFormData({ ...formData, symbol: e.target.value })
                        }
                        className="input-field"
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="quantity" className="input-label">
                        Quantity:
                    </label>
                    <input
                        type="number"
                        id="quantity"
                        value={formData.quantity}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                quantity: e.target.value,
                            })
                        }
                        className="input-field"
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="purchasePrice" className="input-label">
                        Purchase Price:
                    </label>
                    <input
                        type="number"
                        id="purchasePrice"
                        value={formData.purchasePrice}
                        onChange={(e) =>
                            setFormData({ ...formData, purchasePrice: e.target.value })
                        }
                        className="input-field"
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="currentPrice" className="input-label">
                        Current Price:
                    </label>
                    <input
                        type="number"
                        id="currentPrice"
                        value={formData.currentPrice}
                        onChange={(e) =>
                            setFormData({ ...formData, currentPrice: e.target.value })
                        }
                        className="input-field"
                    />
                </div>
                <button
                    onClick={editingPortfolio ? handleSubmitEdit : handleAddPortfolio}
                    className="add-button"
                >
                    {editingPortfolio ? "Update Portfolio" : "Add Portfolio"}{" "}
                </button>
            </div>
            <br />
            <br />
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="filter-buttons">
                        <button onClick={handleShowProfit} className="delete-button">
                            Show Profit
                        </button>
                        <button onClick={handleShowLoss} className="delete-button">
                            Show Loss
                        </button>
                        <button
                            onClick={() => {
                                setShowProfit(false);
                                setShowLoss(false);
                            }}
                            className="delete-button"
                        >
                            Show All
                        </button>
                    </div>
                    <div className="portfolio-rows">
                        {portfolios.map(
                            (portfolio) =>
                                ((showProfit && getProfitLossClass(portfolio) === "profit") ||
                                    (showLoss && getProfitLossClass(portfolio) === "loss") ||
                                    (!showProfit && !showLoss)) && (
                                    <div
                                        key={portfolio._id}
                                        className={`portfolio ${getProfitLossClass(portfolio)}`}
                                    >
                                        <h3 className="portfolio-name">{portfolio.name}</h3>
                                        <table className="stock-table">
                                            <thead>
                                                <tr>
                                                    <th>Symbol</th>
                                                    <th>Quantity</th>
                                                    <th>Purchase Price</th>
                                                    <th>Current Price</th>
                                                    <th>Total Profit/Loss %</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {portfolio.stocks.map((stock, index) => (
                                                    <tr key={index}>
                                                        <td>{stock.symbol}</td>
                                                        <td>{stock.quantity}</td>
                                                        <td>₹{stock.purchasePrice}</td>
                                                        <td>₹{stock.currentPrice}</td>
                                                        <td>{calculateProfitLossPercentage(portfolio)
                                                        }
                                                        %</td>
                                                        <td>
                                                            {editingPortfolio === portfolio._id &&
                                                                editingStock === stock._id ? (
                                                                <>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleSaveEditedStock(
                                                                                portfolio._id,
                                                                                stock._id,
                                                                                formData
                                                                            )
                                                                        }
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button onClick={() => 
                                                                    setEditingStock(null)}>
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleEditStock
                                                                           (portfolio._id, stock._id)
                                                                        }
                                                                        className="delete-button"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleDeleteStock(
                                                                                portfolio._id,
                                                                                stock._id
                                                                            )
                                                                        }
                                                                        className="delete-button"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div>
                                            <strong>CURRENT VALUE</strong>: ₹
                                            {calculateCurrentValue(portfolio).toFixed(2)} ₹
                                            {calculateInvestedAmount(portfolio).toFixed(2)} Invested
                                        </div>
                                        <br />
                                        <button
                                            onClick={() => deletePortfolio(portfolio._id)}
                                            className="delete-button"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => handleEditPortfolio(portfolio)}
                                            className="edit-button"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default App;
